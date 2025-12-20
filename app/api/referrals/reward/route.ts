import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

type Payload = {
  refCode?: string;
  joinedName?: string;
  joinedEmail?: string;
  joinedUserId?: string;
};

const POINTS = 10;

export async function POST(req: NextRequest) {
  if (!adminDb) {
    return NextResponse.json({ error: "Admin DB not configured" }, { status: 500 });
  }

  try {
    const { refCode, joinedName, joinedEmail, joinedUserId } = (await req.json()) as Payload;
    if (!refCode) {
      return NextResponse.json({ error: "Missing refCode" }, { status: 400 });
    }

    const snap = await adminDb
      .collection("users")
      .where("referralCode", "==", refCode)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ message: "No referrer found for code" }, { status: 200 });
    }

    const referrerDoc = snap.docs[0];
    const referrerId = referrerDoc.id;
    const now = new Date().toISOString();

    await adminDb
      .collection("users")
      .doc(referrerId)
      .set(
        {
          referralPoints: FieldValue.increment(POINTS),
          referralJoined: FieldValue.increment(1),
          lastReferralAt: now
        },
        { merge: true }
      );

    await adminDb.collection("referralsLog").add({
      referrerId,
      joinedUserId: joinedUserId || null,
      joinedName: joinedName || "New user",
      joinedEmailMasked: maskEmail(joinedEmail || ""),
      createdAt: now
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("referral reward failed", err);
    return NextResponse.json({ error: "Referral reward failed" }, { status: 500 });
  }
}

function maskEmail(email: string) {
  if (!email || !email.includes("@")) return "*****";
  const [user, domain] = email.split("@");
  return `${user[0] ?? ""}***@${domain}`;
}
