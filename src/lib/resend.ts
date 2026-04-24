const FROM = process.env.RESEND_FROM ?? "noreply@pinkhousesamui.com";

async function sendEmail(payload: { to: string; subject: string; html: string }): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error ${res.status}: ${text}`);
  }
}

export async function sendBookingConfirmation(data: {
  to: string;
  name: string;
  room: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}): Promise<void> {
  await sendEmail({
    to: data.to,
    subject: "Booking Request Received — Pink House Koh Samui",
    html: `
      <h2>Thank you, ${data.name}!</h2>
      <p>We have received your booking request for <strong>${data.room}</strong>.</p>
      <ul>
        <li>Check-in: ${data.checkIn}</li>
        <li>Check-out: ${data.checkOut}</li>
        <li>Guests: ${data.guests}</li>
      </ul>
      <p>We will confirm your reservation within 24 hours.</p>
      <p>Pink House Koh Samui</p>
    `,
  });
}

export async function sendContactReply(data: { to: string; name: string }): Promise<void> {
  await sendEmail({
    to: data.to,
    subject: "We received your message — Pink House Koh Samui",
    html: `
      <h2>Hello ${data.name},</h2>
      <p>Thank you for reaching out. We have received your message and will reply within 24 hours.</p>
      <p>Pink House Koh Samui</p>
    `,
  });
}
