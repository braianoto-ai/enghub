import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, slug, hasTrial } = await req.json();

    if (!name || !email || !slug) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await sendWelcomeEmail({ to: email, name, slug, hasTrial: !!hasTrial });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("notify/welcome error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
