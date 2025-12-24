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

    const code = randomInt(0, 1000000).toString().padStart(6, "0");
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

    // Return fast: give the email provider up to 1s to respond, then continue in the background.
    const SEND_TIMEOUT_MS = 1000;
    const sendPromise = sendVerifyCodeEmail(normalizedEmail, code);
    const sendResult = await Promise.race([
      sendPromise.then(() => "sent" as const).catch((err) => {
        console.error("verify code email failed fast", err);
        return "failed" as const;
      }),
      new Promise<"queued">((resolve) => setTimeout(() => resolve("queued"), SEND_TIMEOUT_MS))
    ]);

    if (sendResult === "failed") {
      return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
    }

    if (sendResult === "queued") {
      void sendPromise.catch((err) => console.error("verify code email failed post-response", err));
    }

    return NextResponse.json({ ok: true, expiresAt, queued: sendResult === "queued" });
  } catch (err: any) {
    console.error("send verify code failed", err);
    return NextResponse.json({ error: err?.message || "Failed to send code" }, { status: 500 });
  }
}
