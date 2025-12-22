import { NextResponse } from "next/server";

import { sendWelcomeEmail } from "@/lib/email/sendWelcomeEmail";

type RequestBody = {
  email?: string;
  name?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const email = body?.email;
    const name = body?.name;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const result = await sendWelcomeEmail(email, name);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Failed to send welcome email", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
