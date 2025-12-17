import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type LandingStats = {
  users: number | null;
  studySets: number | null;
  successStories: number | null;
  updatedAt: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseServer =
  supabaseUrl && supabaseServiceRole ? createClient(supabaseUrl, supabaseServiceRole) : null;

const USAGE_TYPE = "usage-log";

export const dynamic = "force-dynamic";

function parseNullableInt(value: string | undefined) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET() {
  const updatedAt = new Date().toISOString();

  const users = parseNullableInt(process.env.LANDING_USER_COUNT);
  const successStories = parseNullableInt(process.env.LANDING_SUCCESS_STORIES_COUNT);

  let studySets: number | null = null;
  if (supabaseServer) {
    try {
      const { count, error } = await supabaseServer
        .from("resources")
        .select("id", { count: "exact", head: true })
        .neq("type", USAGE_TYPE);
      if (!error) studySets = count ?? 0;
    } catch (err) {
      studySets = null;
    }
  }

  const payload: LandingStats = {
    users,
    studySets,
    successStories,
    updatedAt
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
