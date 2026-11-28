// Pure rules deciding whether a stay can be sold, shared by /api/availability
// (search) and /api/payment-intent (server-side re-check before charging).
import type { DailyRate } from "./smoobu";
import { APARTMENT_TO_ROOM_ID, ROOM_MAX_GUESTS } from "../config/smoobu";

/** ISO dates of each night, from arrival up to (not including) departure. */
export function nightDates(arrival: string, departure: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${arrival}T00:00:00Z`);
  const end = new Date(`${departure}T00:00:00Z`);
  while (cursor < end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

/** Whether the apartment's category can host a party of this size. */
export function fitsParty(apartmentId: number, guests: number): boolean {
  const max = ROOM_MAX_GUESTS[APARTMENT_TO_ROOM_ID[apartmentId] ?? ""];
  return max !== undefined && guests <= max;
}

export type StayCheck =
  | { ok: true; total: number }
  | { ok: false; reason: "unavailable" }
  | { ok: false; reason: "minStay"; minStay: number };

/**
 * Every night must be open, and the stay must reach Smoobu's minimum length of
 * stay for the arrival date. `total` is the undiscounted price from Smoobu.
 */
export function checkStay(daily: Record<string, DailyRate>, nights: string[]): StayCheck {
  const rates = nights.map((d) => daily[d] ?? {});
  if (rates.length === 0 || !rates.every((r) => r.available === 1)) {
    return { ok: false, reason: "unavailable" };
  }
  const minStay = rates[0].min_length_of_stay ?? 1;
  if (nights.length < minStay) return { ok: false, reason: "minStay", minStay };
  return { ok: true, total: rates.reduce((sum, r) => sum + (r.price ?? 0), 0) };
}
