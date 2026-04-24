import { NextRequest, NextResponse } from "next/server";
import { BookingSchema } from "@/lib/validations/booking";
import { sendWhatsApp, bookingNotification } from "@/lib/whatsapp";
import { sendBookingConfirmation } from "@/lib/resend";

const ROOM_NAMES: Record<string, string> = {
  standard: "Standard Room",
  deluxe: "Deluxe Room",
  family: "Family Suite",
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const parsed = BookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, email, phone, roomId, checkIn, checkOut, guests } = parsed.data;
    const roomName = ROOM_NAMES[roomId] ?? roomId;

    await Promise.all([
      sendWhatsApp({
        body: bookingNotification({ name, room: roomName, checkIn, checkOut, guests, phone }),
      }),
      sendBookingConfirmation({ to: email, name, room: roomName, checkIn, checkOut, guests }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
