import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/firebaseAdmin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseServer =
  supabaseUrl && supabaseServiceRole ? createClient(supabaseUrl, supabaseServiceRole) : null;

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

    if (!supabaseServer) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { count, error } = await supabaseServer
      .from("resources")
      .select("id", { count: "exact", head: true })
      .eq("user_id", uid)
      .gte("created_at", startOfMonth);

    if (error) {
      console.error("Usage fetch error", error.message);
      return NextResponse.json({ error: "Usage fetch failed" }, { status: 500 });
    }

    return NextResponse.json({ usage: count ?? 0, limit: 20 });
  } catch (err) {
    console.error("Usage API error", err);
    return NextResponse.json({ error: "Usage fetch failed" }, { status: 500 });
  }
}
