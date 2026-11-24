import { describe, expect, it } from "vitest";
import { canonicalQuery, signSmoobuRequest, smoobuTimestamp } from "./smoobu-hmac";

// Expected signatures were produced independently with the shell recipe from
// Smoobu's docs (openssl dgst -sha256 / -hmac | base64), not by this module.
const base = {
  apiKey: "test_key_123",
  apiSecret: "test_secret_456",
  timestamp: "2026-12-01T10:00:00Z",
  nonce: "550e8400-e29b-41d4-a716-446655440000",
};

describe("signSmoobuRequest", () => {
  it("signs a GET with repeated apartments[] params like openssl does", async () => {
    const signed = await signSmoobuRequest({
      ...base,
      method: "GET",
      // deliberately unsorted: the signer must sort and RFC 3986 encode
      url: "https://login.smoobu.com/api/rates?start_date=2026-12-10&end_date=2026-12-13&apartments[]=3040756&apartments[]=3040751",
    });
    expect(signed.headers["X-Signature"]).toBe("MaqJapAjzGt9wtXOdpHH8mfdjm3vzSSwUxBPA8hlNdk=");
    expect(signed.url).toBe(
      "https://login.smoobu.com/api/rates?apartments%5B%5D=3040751&apartments%5B%5D=3040756&end_date=2026-12-13&start_date=2026-12-10"
    );
  });

  it("signs a POST body (non-ASCII, no query) like openssl does", async () => {
    const signed = await signSmoobuRequest({
      ...base,
      method: "post",
      url: "https://login.smoobu.com/api/reservations",
      body: '{"apartmentId":3040751,"arrivalDate":"2026-12-10","notice":"café & Zoë"}',
    });
    expect(signed.headers["X-Signature"]).toBe("vM36WXqOEU0m1cyXDLyobhnKJRwoDhPC1jp9M2u5h94=");
  });

  it("sends the four required headers", async () => {
    const { headers } = await signSmoobuRequest({
      ...base,
      method: "GET",
      url: "https://login.smoobu.com/api/apartments",
    });
    expect(Object.keys(headers).sort()).toEqual([
      "X-API-Key",
      "X-Nonce",
      "X-Signature",
      "X-Timestamp",
    ]);
    expect(headers["X-API-Key"]).toBe(base.apiKey);
  });
});

describe("canonicalQuery", () => {
  it("encodes spaces as %20, never +", () => {
    expect(canonicalQuery(new URLSearchParams({ q: "a b" }))).toBe("q=a%20b");
  });
});

describe("smoobuTimestamp", () => {
  it("drops milliseconds", () => {
    expect(smoobuTimestamp(new Date("2026-12-01T10:00:00.123Z"))).toBe("2026-12-01T10:00:00Z");
  });
});
