interface WhatsAppMessage {
  to?: string;
  body: string;
}

export async function sendWhatsApp({ to, body }: WhatsAppMessage): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Twilio credentials not configured");

  const recipient = to ?? process.env.WHATSAPP_TO;
  if (!recipient) throw new Error("WHATSAPP_TO not configured");

  const from = process.env.WHATSAPP_FROM ?? "whatsapp:+14155238886";

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ From: from, To: recipient, Body: body }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio error ${res.status}: ${text}`);
  }
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
