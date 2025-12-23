import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { adminAuth } from "@/lib/firebase/admin";
import { adminDb, verifyToken } from "@/lib/firebaseAdmin";
import { sendVerifyCodeEmail } from "@/lib/email/sendVerifyCodeEmail";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded?.uid || !decoded?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email || email.toLowerCase() !== decoded.email.toLowerCase()) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 400 });
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Admin SDK not configured" }, { status: 500 });
    }

    const code = randomInt(0, 1000000).toString().padStart(6, "0");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const docRef = adminDb.collection("email_verification_codes").doc(decoded.uid);
    await docRef.set({
      uid: decoded.uid,
      email: decoded.email,
      code,
      createdAt: new Date().toISOString(),
      expiresAt
    });

    await sendVerifyCodeEmail(decoded.email, code);

    return NextResponse.json({ ok: true, expiresAt });
  } catch (err: any) {
    console.error("send verify code failed", err);
    return NextResponse.json({ error: err?.message || "Failed to send code" }, { status: 500 });
  }
}
