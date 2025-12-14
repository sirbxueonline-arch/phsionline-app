import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/firebaseAdmin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseServer = supabaseUrl && supabaseServiceRole ? createClient(supabaseUrl, supabaseServiceRole) : null;

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!supabaseServer) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

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

  const { data, error } = await supabaseServer
    .from("resources")
    .insert({
      user_id: uid,
      type,
      title: title || `Generated ${type}`,
      subject: subject || null,
      content
    })
    .select("id")
    .single();

  if (error) {
    console.error("Save resource failed", error);
    return NextResponse.json({ error: error.message || "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ id: data?.id });
}
