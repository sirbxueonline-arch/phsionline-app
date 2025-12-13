import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripePricePro = process.env.STRIPE_PRICE_PRO_ID;

const stripe = stripeSecret
  ? new Stripe(stripeSecret, {
      apiVersion: "2024-06-20"
    })
  : null;

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }

  let plan = "pro";
  try {
    const data = await request.json();
    if (typeof data?.plan === "string") {
      plan = data.plan;
    }
  } catch {
    // ignore malformed JSON and fall back to default plan
  }

  const origin = headers().get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const successUrl = `${origin}/upgrade?status=success`;
  const cancelUrl = `${origin}/upgrade?status=cancelled`;

  const lineItem = stripePricePro
    ? { price: stripePricePro, quantity: 1 }
    : {
        price_data: {
          currency: "usd",
          product_data: { name: "StudyPilot Pro (Monthly)" },
          recurring: { interval: "month" },
          unit_amount: 1200
        },
        quantity: 1
      };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [lineItem],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { plan }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session error", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
