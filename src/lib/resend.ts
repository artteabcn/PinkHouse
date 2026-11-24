const DEFAULT_FROM = "noreply@pinkhousekohsamui.com";

export async function sendEmail(payload: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}): Promise<void> {
  // Read env vars at call time, not module load: on Cloudflare the bindings
  // are only guaranteed to be populated once a request is being handled.
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  const from = payload.from || process.env.RESEND_FROM || DEFAULT_FROM;
  const recipients = Array.isArray(payload.to) ? payload.to.join(",") : payload.to;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    // Name the sender and recipient so a log line is enough to diagnose an
    // unverified domain (403), a bad key (401) or a bad address (422).
    console.error(`Resend rejected email from=${from} to=${recipients} status=${res.status}`, text);
    throw new Error(`Resend error ${res.status}: ${text}`);
  }

  try {
    const body = (await res.json()) as { id?: string };
    console.info(`Resend accepted email id=${body.id ?? "?"} from=${from} to=${recipients}`);
  } catch {
    // Logging only — a non-JSON success body must not fail the send.
  }
}

// sendBookingConfirmation has moved to src/lib/guest-email.ts so the
// template can be localized and live alongside its message imports.

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
