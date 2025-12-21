import { NextResponse } from "next/server";
import { adminDb, verifyToken } from "@/lib/firebaseAdmin";

export async function GET(request: Request) {
  try {
    const idToken = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(idToken);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const uid = decoded.uid;

    if (!adminDb) {
      return NextResponse.json({ error: "Export unavailable" }, { status: 500 });
    }

    const userDoc = await adminDb.collection("users").doc(uid).get();

    const profile = userDoc.exists ? (userDoc.data() as Record<string, any>) : {};
    const email = profile?.email || decoded.email || "unknown";
    const displayName = profile?.name || profile?.displayName || decoded.name || "unknown";
    const plan = profile?.plan || profile?.subscriptionPlan || "free";

    const lines = [
      "StudyPilot export",
      `Exported: ${new Date().toISOString()}`,
      `Email: ${email}`,
      `Display name: ${displayName}`,
      `User ID: ${uid}`,
      `Plan: ${plan}`
    ];

    const payload = lines.join("\n");

    return new NextResponse(payload, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="studypilot-export.txt"'
      }
    });
  } catch (err) {
    console.error("Export error", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
