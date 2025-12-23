import { NextResponse } from "next/server";
import { sendResetEmail } from "@/lib/email/sendResetEmail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    await sendResetEmail(email);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("send reset email failed", err);
    return NextResponse.json({ error: err?.message || "Failed to send reset email" }, { status: 500 });
  }
}
