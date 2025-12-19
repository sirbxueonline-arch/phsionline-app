import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyToken } from "@/lib/firebaseAdmin";
const USAGE_TYPE = "usage-log";
const USAGE_LIMIT = 20;

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    let uid: string | null = null;
    if (token) {
      const decoded = await verifyToken(token);
      uid = decoded?.uid || null;
      if (!uid) {
        try {
          const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
          uid = payload?.user_id || payload?.uid || payload?.sub || null;
        } catch (err) {
          uid = null;
        }
      }
    }

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Server DB not configured" }, { status: 500 });
    }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const snap = await adminDb
      .collection("resources")
      .where("userId", "==", uid)
      .where("type", "==", USAGE_TYPE)
      .where("createdAt", ">=", startOfMonth)
      .get();

    return NextResponse.json({ usage: snap.size ?? 0, limit: USAGE_LIMIT });
  } catch (err) {
    console.error("Usage API error", err);
    return NextResponse.json({ error: "Usage fetch failed" }, { status: 500 });
  }
}
