const FROM = process.env.RESEND_FROM ?? "noreply@pinkhousesamui.com";

export async function sendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: payload.from ?? FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
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
  totalPrice?: number;
  depositPaid?: number;
  balanceDue?: number;
}): Promise<void> {
  const hasDeposit = data.depositPaid !== undefined && data.depositPaid > 0;
  const subject = hasDeposit
    ? "Booking Confirmed — Pink House Koh Samui"
    : "Booking Request Received — Pink House Koh Samui";
  const lead = hasDeposit
    ? `Your stay at <strong>${data.room}</strong> is confirmed. Your deposit has been received.`
    : `We have received your booking request for <strong>${data.room}</strong>.`;
  const closing = hasDeposit
    ? `<p>Please note: the deposit is non-refundable. The balance is payable on arrival in cash or by card. We look forward to welcoming you.</p>`
    : `<p>We will confirm your reservation within 24 hours.</p>`;
  const totalLine =
    data.totalPrice !== undefined
      ? `<li>Total stay: ${data.totalPrice.toLocaleString()} THB</li>`
      : "";
  const depositLine =
    hasDeposit && data.depositPaid !== undefined
      ? `<li>Deposit paid: <strong>${data.depositPaid.toLocaleString()} THB</strong></li>`
      : "";
  const balanceLine =
    hasDeposit && data.balanceDue !== undefined && data.balanceDue > 0
      ? `<li>Balance due on arrival: <strong>${data.balanceDue.toLocaleString()} THB</strong></li>`
      : "";
  await sendEmail({
    to: data.to,
    subject,
    html: `
      <h2>Thank you, ${data.name}!</h2>
      <p>${lead}</p>
      <ul>
        <li>Check-in: ${data.checkIn}</li>
        <li>Check-out: ${data.checkOut}</li>
        <li>Guests: ${data.guests}</li>
        ${totalLine}
        ${depositLine}
        ${balanceLine}
      </ul>
      ${closing}
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
