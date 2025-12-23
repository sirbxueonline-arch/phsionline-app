import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { adminDb, verifyToken } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded?.uid || !decoded?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Admin SDK not configured" }, { status: 500 });
    }

    const docRef = adminDb.collection("email_verification_codes").doc(decoded.uid);
    const snap = await docRef.get();
    const data = snap.data() as any;
    if (!data || !data.code) {
      return NextResponse.json({ error: "No code found. Request a new one." }, { status: 400 });
    }
    if (data.email?.toLowerCase() !== decoded.email.toLowerCase()) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 400 });
    }
    const expired = data.expiresAt ? new Date(data.expiresAt).getTime() < Date.now() : true;
    if (expired) {
      await docRef.delete().catch(() => {});
      return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
    }
    if (String(code).trim() !== String(data.code).trim()) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    await adminAuth.updateUser(decoded.uid, { emailVerified: true });
    await docRef.delete().catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("verify code failed", err);
    return NextResponse.json({ error: err?.message || "Failed to verify code" }, { status: 500 });
  }
}
