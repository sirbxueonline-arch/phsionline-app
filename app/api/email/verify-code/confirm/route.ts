import { NextResponse } from "next/server";
import { adminAuth, adminDb, verifyToken } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const body = await req.json();
    const { code, email, password, name, referralCode } = body || {};
    if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });
    const normalizedEmail = String(email || "").trim().toLowerCase();

    const decoded = token ? await verifyToken(token) : null;
    const tokenEmail = decoded?.email || null;
    const targetEmail = tokenEmail ? tokenEmail.toLowerCase() : normalizedEmail;
    if (!targetEmail) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    if (!adminDb) {
      return NextResponse.json({ error: "Admin SDK not configured" }, { status: 500 });
    }

    const docRef = adminDb.collection("email_verification_codes").doc(targetEmail);
    const snap = await docRef.get();
    const data = snap.data() as any;
    if (!data || !data.code) {
      return NextResponse.json({ error: "No code found. Request a new one." }, { status: 400 });
    }
    if (data.email?.toLowerCase() !== targetEmail) {
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

    // If user is already authenticated, just mark verified.
    if (decoded?.uid && adminAuth) {
      await adminAuth.updateUser(decoded.uid, { emailVerified: true });
      await docRef.delete().catch(() => {});
      return NextResponse.json({ ok: true, verified: true, created: false });
    }

    // Signup path: create user after code match.
    if (!password) {
      return NextResponse.json({ error: "Password is required to finish signup" }, { status: 400 });
    }
    if (!adminAuth) {
      return NextResponse.json({ error: "Admin SDK not configured" }, { status: 500 });
    }

    let userRecord = null;
    try {
      userRecord = await adminAuth.getUserByEmail(targetEmail);
      return NextResponse.json({ error: "Account already exists. Try signing in." }, { status: 400 });
    } catch (err) {
      // not found -> ok
    }

    userRecord = await adminAuth.createUser({
      email: targetEmail,
      password: String(password),
      displayName: name || undefined,
      emailVerified: true
    });

    await docRef.delete().catch(() => {});

    // Minimal profile doc
    const createdAt = new Date().toISOString();
    await adminDb
      .collection("users")
      .doc(userRecord.uid)
      .set(
        {
          name: name || data?.name || userRecord.displayName || "Pilot",
          displayName: name || data?.name || userRecord.displayName || "Pilot",
          email: targetEmail,
          createdAt,
          updatedAt: createdAt,
          referralCode: userRecord.uid.slice(0, 8),
          referredBy: data?.referralCode || referralCode || null,
          avatarUrl: null,
          timezone: null,
          role: "user",
          permissions: [],
          social: {},
          onboarding: { completed: false, step: "signup", completedAt: null },
          onboardingCompleted: false,
          defaultTool: "flashcards",
          themePreference: "system"
        },
        { merge: true }
      );

    return NextResponse.json({ ok: true, verified: true, created: true, uid: userRecord.uid });
  } catch (err: any) {
    console.error("verify code failed", err);
    return NextResponse.json({ error: err?.message || "Failed to verify code" }, { status: 500 });
  }
}
