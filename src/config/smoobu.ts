// Smoobu apartment + channel configuration.
export const SMOOBU_CHANNEL_ID_DIRECT_WEBSITE = 5722806;
export const SMOOBU_CHANNEL_ID_BLOCKED = 5722791;

// 3040741 is the whole house ("PINK HOUSE KOH SAMUI"); the six rooms are linked
// under it in Smoobu. The account's other two properties are not ours to sell.
export const SMOOBU_APARTMENT_IDS = [
  3040741, 3040751, 3040756, 3040766, 3040771, 3040776, 3040781,
] as const;

// The 6 physical rooms fall into 3 room categories in Smoobu, plus the villa:
//   Villa  → 3040741 (entire house)
//   Cosy   → 3040751 (Cosy 1), 3040766 (Cosy 2), 3040781 (Cosy 3)
//   Deluxe → 3040756 (Deluxe)
//   Family → 3040771 (Familiale 1), 3040776 (Familiale 2)
// The roomId values match the `id` of each item in `rooms.items` (messages/*.json).
// Smoobu apartmentId → local roomId (category).
export const APARTMENT_TO_ROOM_ID: Record<number, string> = {
  3040741: "villa",
  3040751: "cosy",
  3040766: "cosy",
  3040781: "cosy",
  3040756: "deluxe",
  3040771: "family",
  3040776: "family",
};

// Local roomId (category) → default Smoobu apartmentId (used when a direct
// booking is made without going through the availability search). Real
// assignment of the booked unit happens at the availability step.
export const ROOM_TO_APARTMENT_ID: Record<string, number> = {
  villa: 3040741,
  cosy: 3040751,
  deluxe: 3040756,
  family: 3040771,
};

// Largest party (adults + children) each category can host.
export const ROOM_MAX_GUESTS: Record<string, number> = {
  villa: 14,
  cosy: 2,
  deluxe: 2,
  family: 3,
};

// Upper bound accepted by the booking forms and APIs (the villa's capacity).
export const MAX_PARTY_SIZE = ROOM_MAX_GUESTS.villa;

// Photo shown for a category until one is uploaded in /content/media.
export function roomFallbackImage(roomId: string | null): string {
  return roomId === "villa" ? "/images/main4.jpeg" : "/images/room.jpeg";
}
