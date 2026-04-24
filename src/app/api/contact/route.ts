import { NextRequest, NextResponse } from "next/server";
import { ContactSchema } from "@/lib/validations/contact";
import { sendWhatsApp, contactNotification } from "@/lib/whatsapp";
import { sendContactReply } from "@/lib/resend";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, email, message } = parsed.data;

    await Promise.all([
      sendWhatsApp({ body: contactNotification({ name, email, message }) }),
      sendContactReply({ to: email, name }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
