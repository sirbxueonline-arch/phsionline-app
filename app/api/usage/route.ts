import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyToken } from "@/lib/firebaseAdmin";
const USAGE_TYPE = "usage-log";
const USAGE_LIMIT = 20;
const UNLIMITED_EMAILS = ["studypilot.app@gmail.com"].map((e) => e.toLowerCase());

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    let uid: string | null = null;
    let tokenEmail: string | null = null;
    if (token) {
      const decoded = await verifyToken(token);
      uid = decoded?.uid || null;
      tokenEmail = decoded?.email?.toLowerCase() || null;
      if (!uid) {
        try {
          const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
          uid = payload?.user_id || payload?.uid || payload?.sub || null;
          tokenEmail = tokenEmail || payload?.email?.toLowerCase() || null;
        } catch (err) {
          uid = null;
        }
      }
    }

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unlimited = await isUnlimitedUser(uid, tokenEmail);

    if (!adminDb) {
      console.warn("Usage API: admin DB not configured; returning zero usage");
      return NextResponse.json({
        usage: 0,
        limit: unlimited ? null : USAGE_LIMIT,
        status: unlimited ? "unlimited" : "untracked"
      });
    }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    let usage = 0;
    if (!unlimited) {
      try {
        const snap = await adminDb
          .collection("resources")
          .where("userId", "==", uid)
          .where("type", "==", USAGE_TYPE)
          .where("createdAt", ">=", startOfMonth)
          .get();
        usage = snap.size ?? 0;
      } catch (err) {
        console.warn("Usage API: DB query failed, falling back to zero usage", err);
        usage = 0;
      }
    }

    return NextResponse.json({
      usage,
      limit: unlimited ? null : USAGE_LIMIT,
      status: unlimited ? "unlimited" : "standard"
    });
  } catch (err) {
    console.error("Usage API error", err);
    return NextResponse.json({ error: "Usage fetch failed" }, { status: 500 });
  }
}

async function isUnlimitedUser(uid: string, tokenEmail: string | null) {
  const allowlist = new Set(UNLIMITED_EMAILS);
  if (tokenEmail && allowlist.has(tokenEmail)) return true;
  if (!adminDb) return false;
  try {
    const snap = await adminDb.collection("users").doc(uid).get();
    const data = (snap.data() as any) || {};
    const email = data.email ? String(data.email).toLowerCase() : null;
    const role = data.role;
    const permissions: string[] = data.permissions || [];
    if (role === "admin") return true;
    if (permissions.includes("unlimited")) return true;
    if (email && allowlist.has(email)) return true;
  } catch (err) {
    console.warn("Usage API: unlimited check failed", err);
  }
  return false;
}
