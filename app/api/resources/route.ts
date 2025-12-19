import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyToken } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!adminDb) return NextResponse.json({ error: "Server DB not configured" }, { status: 500 });

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

  const { content, type, title, subject } = await req.json();
  if (!content || !type) {
    return NextResponse.json({ error: "Missing content or type" }, { status: 400 });
  }

  try {
    const docRef = await adminDb.collection("resources").add({
      userId: uid,
      type,
      title: title || `Generated ${type}`,
      subject: subject || null,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return NextResponse.json({ id: docRef.id });
  } catch (error: any) {
    console.error("Save resource failed", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
