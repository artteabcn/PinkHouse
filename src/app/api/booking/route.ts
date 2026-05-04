import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { BookingSchema, type BookingInput } from "@/lib/validations/booking";
import { sendWhatsApp, bookingNotification } from "@/lib/whatsapp";
import { sendBookingConfirmation } from "@/lib/resend";
import { createReservation, SmoobuError } from "@/lib/smoobu";
import { ROOM_TO_APARTMENT_ID, SMOOBU_CHANNEL_ID_DIRECT_WEBSITE } from "@/config/smoobu";
import { getDbOrNull } from "@/lib/db/get-db";
import { bookings } from "@/db/schema";

const ROOM_NAMES: Record<string, string> = {
  standard: "Standard Room",
  deluxe: "Deluxe Room",
  family: "Family Suite",
};

function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

async function insertLocal(data: BookingInput, apartmentId: number): Promise<number | null> {
  const db = await getDbOrNull();
  if (!db) return null;
  const guests = data.adults + data.children;
  const result = await db
    .insert(bookings)
    .values({
      name: data.name,
      email: data.email,
      phone: data.phone,
      roomId: data.roomId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests,
      notes: data.notes,
      smoobuApartmentId: apartmentId,
      channelId: SMOOBU_CHANNEL_ID_DIRECT_WEBSITE,
      totalPrice: data.totalPrice,
      currency: "THB",
      locale: data.locale,
    })
    .returning({ id: bookings.id });
  return result[0]?.id ?? null;
}

async function markBookingStatus(
  localId: number,
  status: "confirmed" | "failed",
  smoobuReservationId?: number
): Promise<void> {
  const db = await getDbOrNull();
  if (!db) return;
  await db
    .update(bookings)
    .set({
      status,
      smoobuReservationId: smoobuReservationId ?? null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(bookings.id, localId));
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let parsed: BookingInput;
  try {
    const body: unknown = await req.json();
    const result = BookingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    parsed = result.data;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const apartmentId = parsed.apartmentId ?? ROOM_TO_APARTMENT_ID[parsed.roomId];
  if (!apartmentId) {
    return NextResponse.json({ error: "Unknown room" }, { status: 400 });
  }

  const localId = await insertLocal(parsed, apartmentId);

  let smoobuReservationId: number | undefined;
  try {
    const { firstName, lastName } = splitName(parsed.name);
    const reservation = await createReservation({
      apartmentId,
      channelId: SMOOBU_CHANNEL_ID_DIRECT_WEBSITE,
      arrivalDate: parsed.checkIn,
      departureDate: parsed.checkOut,
      firstName,
      lastName,
      email: parsed.email,
      phone: parsed.phone,
      adults: parsed.adults,
      children: parsed.children,
      price: parsed.totalPrice,
      language: parsed.locale,
      notice: parsed.notes,
    });
    smoobuReservationId = reservation.id;
  } catch (err) {
    if (localId !== null) await markBookingStatus(localId, "failed");
    if (err instanceof SmoobuError) {
      return NextResponse.json(
        { error: "Reservation could not be created", status: err.status },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  if (localId !== null) {
    await markBookingStatus(localId, "confirmed", smoobuReservationId);
  }

  const roomName = ROOM_NAMES[parsed.roomId] ?? parsed.roomId;
  const guests = parsed.adults + parsed.children;

  await Promise.allSettled([
    sendWhatsApp({
      body: bookingNotification({
        name: parsed.name,
        room: roomName,
        checkIn: parsed.checkIn,
        checkOut: parsed.checkOut,
        guests,
        phone: parsed.phone,
      }),
    }),
    sendBookingConfirmation({
      to: parsed.email,
      name: parsed.name,
      room: roomName,
      checkIn: parsed.checkIn,
      checkOut: parsed.checkOut,
      guests,
    }),
  ]);

  return NextResponse.json({
    ok: true,
    reservationId: smoobuReservationId,
    bookingId: localId,
  });
}
