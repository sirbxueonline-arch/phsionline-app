import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

type LandingStats = {
  users: number | null;
  studySets: number | null;
  successStories: number | null;
  updatedAt: string;
};

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
  if (adminDb) {
    try {
      const snap = await adminDb.collection("resources").get();
      studySets = snap.docs.filter((d) => (d.data() as any)?.type !== USAGE_TYPE).length;
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
