import { NextResponse } from "next/server";

export async function GET() {
  const data = {
    profile: { name: "Pilot", email: "user@example.com" },
    resources: [{ id: "demo", title: "Sample flashcards", type: "flashcards" }]
  };
  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="studypilot-export.json"'
    }
  });
}
