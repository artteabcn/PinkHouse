import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

interface WhatsAppMessage {
  to?: string;
  body: string;
}

export async function sendWhatsApp({ to, body }: WhatsAppMessage): Promise<void> {
  const recipient = to ?? process.env.WHATSAPP_TO;
  if (!recipient) throw new Error("WHATSAPP_TO not configured");

  await client.messages.create({
    from: process.env.WHATSAPP_FROM ?? "whatsapp:+14155238886",
    to: recipient,
    body,
  });
}

export function bookingNotification(data: {
  name: string;
  room: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  phone: string;
}): string {
  return [
    `🏠 New Booking Request — Pink House`,
    `Guest: ${data.name}`,
    `Room: ${data.room}`,
    `Check-in: ${data.checkIn}`,
    `Check-out: ${data.checkOut}`,
    `Guests: ${data.guests}`,
    `Contact: ${data.phone}`,
  ].join("\n");
}

export function contactNotification(data: {
  name: string;
  email: string;
  message: string;
}): string {
  return [
    `📩 New Contact Message — Pink House`,
    `From: ${data.name} (${data.email})`,
    `Message: ${data.message}`,
  ].join("\n");
}
