import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { checkStay, fitsParty, nightDates } from "@/lib/availability";
import {
  APARTMENT_TO_ROOM_ID,
  ROOM_MAX_GUESTS,
  ROOM_TO_APARTMENT_ID,
  SMOOBU_APARTMENT_IDS,
} from "@/config/smoobu";
import { getRates } from "@/lib/smoobu";
import { POST } from "@/app/api/availability/route";
import en from "../../messages/en.json";
import fr from "../../messages/fr.json";
import de from "../../messages/de.json";
import th from "../../messages/th.json";

vi.mock("@/lib/smoobu", () => ({
  getRates: vi.fn(),
  SmoobuError: class SmoobuError extends Error {},
}));

const VILLA = 3040741;
const NIGHTS = ["2026-12-10", "2026-12-11", "2026-12-12", "2026-12-13"];
const open = (price: number, minStay: number): Record<string, unknown> =>
  Object.fromEntries(NIGHTS.map((d) => [d, { available: 1, price, min_length_of_stay: minStay }]));

describe("stay rules", () => {
  it("lists the nights, excluding departure", () => {
    expect(nightDates("2026-12-10", "2026-12-13")).toEqual(NIGHTS.slice(0, 3));
  });

  it("enforces each category's capacity", () => {
    expect(fitsParty(VILLA, 14)).toBe(true);
    expect(fitsParty(VILLA, 15)).toBe(false);
    expect(fitsParty(3040751, 2)).toBe(true);
    expect(fitsParty(3040751, 3)).toBe(false);
    expect(fitsParty(3040771, 3)).toBe(true);
    expect(fitsParty(999, 1)).toBe(false);
  });

  it("rejects a closed or missing night", () => {
    expect(checkStay({}, ["2026-12-10"])).toEqual({ ok: false, reason: "unavailable" });
    expect(checkStay({ "2026-12-10": { available: 0, price: 1 } }, ["2026-12-10"]).ok).toBe(false);
  });

  it("enforces the arrival date's minimum stay", () => {
    const daily = open(2000, 4) as Parameters<typeof checkStay>[0];
    expect(checkStay(daily, NIGHTS.slice(0, 3))).toEqual({
      ok: false,
      reason: "minStay",
      minStay: 4,
    });
    expect(checkStay(daily, NIGHTS)).toEqual({ ok: true, total: 8000 });
  });
});

describe("room configuration", () => {
  it("maps every sold apartment to a category with a capacity", () => {
    for (const id of SMOOBU_APARTMENT_IDS) {
      expect(ROOM_MAX_GUESTS[APARTMENT_TO_ROOM_ID[id]]).toBeGreaterThan(0);
    }
    for (const id of Object.values(ROOM_TO_APARTMENT_ID)) {
      expect(SMOOBU_APARTMENT_IDS as readonly number[]).toContain(id);
    }
  });

  it("keeps all four locales in step with the capacities", () => {
    for (const messages of [en, fr, de, th]) {
      expect(messages.rooms.items.map((r) => r.id)).toEqual(["cosy", "deluxe", "family", "villa"]);
      for (const room of messages.rooms.items) {
        expect(room.maxGuests).toBe(ROOM_MAX_GUESTS[room.id]);
      }
      expect(messages.rooms.priceOnDates).toBeTruthy();
    }
  });
});

describe("POST /api/availability", () => {
  beforeEach(() => {
    vi.mocked(getRates).mockImplementation(
      async ({ apartmentIds }) =>
        Object.fromEntries(
          apartmentIds.map((id) => [String(id), id === VILLA ? open(6000, 4) : open(1500, 2)])
        ) as Awaited<ReturnType<typeof getRates>>
    );
  });

  async function search(
    departure: string,
    adults: number
  ): Promise<{ ids: number[]; minStayRequired: number; total?: number }> {
    const res = await POST(
      new NextRequest("http://localhost/api/availability", {
        method: "POST",
        body: JSON.stringify({ arrival: "2026-12-10", departure, adults, children: 0 }),
      })
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      available: Array<{ apartmentId: number; totalPrice: number }>;
      minStayRequired: number;
    };
    return {
      ids: json.available.map((a) => a.apartmentId),
      minStayRequired: json.minStayRequired,
      total: json.available.find((a) => a.apartmentId === VILLA)?.totalPrice,
    };
  }

  it("offers the villa alongside rooms for a 4-night stay for two", async () => {
    const result = await search("2026-12-14", 2);
    expect(result.ids).toHaveLength(7);
    expect(result.total).toBe(22800); // 4 x 6000 less the 5% direct discount
  });

  it("hides the villa below its 4-night minimum but keeps the rooms", async () => {
    const result = await search("2026-12-12", 2);
    expect(result.ids).toHaveLength(6);
    expect(result.ids).not.toContain(VILLA);
  });

  it("offers only the villa to a large group, and reports its minimum stay", async () => {
    expect((await search("2026-12-14", 10)).ids).toEqual([VILLA]);
    const short = await search("2026-12-13", 10);
    expect(short.ids).toEqual([]);
    expect(short.minStayRequired).toBe(4);
  });

  it("offers family rooms and the villa to three guests", async () => {
    expect((await search("2026-12-14", 3)).ids).toEqual([VILLA, 3040771, 3040776]);
  });
});
