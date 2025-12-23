import { NextResponse } from "next/server";
import { sendVerifyEmail } from "@/lib/email/sendVerifyEmail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    await sendVerifyEmail(email);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("send verify email failed", err);
    return NextResponse.json({ error: err?.message || "Failed to send verification email" }, { status: 500 });
  }
}
