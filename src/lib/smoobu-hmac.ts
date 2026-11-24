// HMAC request signing for the Smoobu API.
// Spec: https://docs.smoobu.com/ -> "HMAC Authentication". Smoobu sunset the
// legacy `Api-Key` header on 2026-10-31, so every request must carry
// X-API-Key / X-Timestamp / X-Nonce / X-Signature.
//
// Uses Web Crypto only (no Node `crypto`), so it runs on Cloudflare Workers.

const encoder = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

function toBase64(buf: ArrayBuffer): string {
  let binary = "";
  for (const b of new Uint8Array(buf)) binary += String.fromCharCode(b);
  return btoa(binary);
}

// RFC 3986 percent-encoding: a space is %20 (not +) and [] is %5B%5D.
function rfc3986(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

/** Query string with RFC 3986 encoding, sorted by key then value. */
export function canonicalQuery(params: URLSearchParams): string {
  const pairs: Array<[string, string]> = Array.from(params.entries()).map(([k, v]) => [
    rfc3986(k),
    rfc3986(v),
  ]);
  pairs.sort((a, b) => {
    if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1;
    if (a[1] !== b[1]) return a[1] < b[1] ? -1 : 1;
    return 0;
  });
  return pairs.map(([k, v]) => `${k}=${v}`).join("&");
}

export interface SignInput {
  method: string;
  /** Absolute request URL; its path and query are signed. */
  url: string;
  /** Exact string sent as the request body ("" for GET). */
  body?: string;
  apiKey: string;
  apiSecret: string;
  /** ISO 8601 UTC, e.g. 2026-04-01T12:00:00Z (within 5 minutes of Smoobu's clock). */
  timestamp: string;
  /** Unique per request (UUID v4). */
  nonce: string;
}

export interface SignedRequest {
  /** URL to fetch: same query as was signed, in canonical order. */
  url: string;
  headers: Record<string, string>;
}

export async function signSmoobuRequest(input: SignInput): Promise<SignedRequest> {
  const target = new URL(input.url);
  const query = canonicalQuery(target.searchParams);

  const bodyHash = toHex(await crypto.subtle.digest("SHA-256", encoder.encode(input.body ?? "")));
  const canonical = [
    input.method.toUpperCase(),
    target.pathname,
    query,
    input.timestamp,
    input.nonce,
    bodyHash,
    input.apiKey,
  ].join("\n");

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(input.apiSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = toBase64(await crypto.subtle.sign("HMAC", key, encoder.encode(canonical)));

  // Send exactly the query we signed so both sides see the same string.
  target.search = query;
  return {
    url: target.toString(),
    headers: {
      "X-API-Key": input.apiKey,
      "X-Timestamp": input.timestamp,
      "X-Nonce": input.nonce,
      "X-Signature": signature,
    },
  };
}

/** Current UTC time without milliseconds, as in Smoobu's examples. */
export function smoobuTimestamp(now: Date = new Date()): string {
  return now.toISOString().replace(/\.\d{3}Z$/, "Z");
}
