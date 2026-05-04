// Smoobu apartment + channel configuration.
export const SMOOBU_CHANNEL_ID_DIRECT_WEBSITE = 5722806;
export const SMOOBU_CHANNEL_ID_BLOCKED = 5722791;

export const SMOOBU_APARTMENT_IDS = [3040751, 3040756, 3040766, 3040771, 3040776, 3040781] as const;

// All 6 physical apartments are the same room type ("standard").
// Smoobu apartmentId → local roomId.
export const APARTMENT_TO_ROOM_ID: Record<number, string> = Object.fromEntries(
  SMOOBU_APARTMENT_IDS.map((id) => [id, "standard"])
);

// Local roomId → default Smoobu apartmentId (used when a direct booking is
// made without going through the availability search). Real assignment of
// the booked unit happens at the availability step.
export const ROOM_TO_APARTMENT_ID: Record<string, number> = {
  standard: SMOOBU_APARTMENT_IDS[0],
};
