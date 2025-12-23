import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { adminDb, verifyToken } from "@/lib/firebaseAdmin";
import { sendVerifyCodeEmail } from "@/lib/email/sendVerifyCodeEmail";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    let tokenEmail: string | null = null;
    if (token) {
      const decoded = await verifyToken(token);
      tokenEmail = decoded?.email || null;
    }

    const { email, name, referralCode } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (tokenEmail && tokenEmail.toLowerCase() !== normalizedEmail) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Admin SDK not configured" }, { status: 500 });
    }

    const code = randomInt(0, 100000000).toString().padStart(8, "0");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const docRef = adminDb.collection("email_verification_codes").doc(normalizedEmail);
    await docRef.set({
      email: normalizedEmail,
      code,
      createdAt: new Date().toISOString(),
      expiresAt,
      referralCode: referralCode || null,
      name: name || null
    });

    await sendVerifyCodeEmail(normalizedEmail, code);

    return NextResponse.json({ ok: true, expiresAt });
  } catch (err: any) {
    console.error("send verify code failed", err);
    return NextResponse.json({ error: err?.message || "Failed to send code" }, { status: 500 });
  }
}
