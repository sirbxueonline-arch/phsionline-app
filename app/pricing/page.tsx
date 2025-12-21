"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type Plan = {
  name: string;
  audience: string;
  priceMonthly?: string;
  priceYearly?: string;
  badge?: string;
  features: string[];
  cta: { label: string; href: string; variant: "default" | "secondary" };
};

const plans: Plan[] = [
  {
    name: "Free",
    audience: "Try StudyPilot • Light review",
    features: [
      "Create up to 20 study sets/month (about 2–3 sessions/week)",
      "Flashcards, quizzes, study plans",
      "Great for light review",
      "Access to dashboard"
    ],
    cta: { label: "Continue free", href: "/auth/signup", variant: "secondary" }
  },
  {
    name: "Pro",
    audience: "Daily exam prep without hitting limits",
    priceMonthly: "$10",
    priceYearly: "$8",
    badge: "Most popular",
    features: [
      "Study daily without limits (200+ sets/month)",
      "Faster, higher-quality questions with fewer errors",
      "Match your exact exam format and syllabus",
      "Cancel anytime • No lock-in"
    ],
    cta: { label: "Start Pro", href: "/upgrade", variant: "default" }
  },
  {
    name: "Teams",
    audience: "For shared libraries & analytics (5+ users)",
    priceMonthly: "$18",
    priceYearly: "$15",
    features: [
      "Shared libraries & collaboration (starting at 5 users)",
      "Admin controls & permissions",
      "Team analytics and usage insights",
      "Priority support and onboarding"
    ],
    cta: { label: "Contact sales", href: "/pricing/contact", variant: "default" }
  }
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  const renderPrice = (plan: Plan) => {
    if (plan.name === "Free") {
      return (
        <div className="space-y-1">
          <p className="text-5xl font-semibold text-slate-900">Free</p>
          <p className="text-sm text-slate-600">No card needed</p>
        </div>
      );
    }
    const price = billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
    const interval =
      billing === "monthly"
        ? "per month, billed monthly"
        : plan.name === "Teams"
        ? "per user / month, billed yearly"
        : "per month, billed yearly";
    return (
      <div className="space-y-1">
        <p className="text-5xl font-semibold text-slate-900">{price}</p>
        <p className="text-sm text-slate-600">{interval}</p>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-16 text-slate-900">
      <section className="mx-auto max-w-5xl space-y-4 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Simple, transparent pricing.</h1>
        <p className="text-slate-600">StudyPilot is free to start. Upgrade only if you need more.</p>
        <div className="mx-auto flex w-fit items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          <Button
            size="sm"
            variant={billing === "monthly" ? "default" : "secondary"}
            className={
              billing === "monthly"
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "border-transparent text-slate-600 hover:text-slate-800"
            }
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </Button>
          <Button
            size="sm"
            variant={billing === "yearly" ? "default" : "secondary"}
            className={
              billing === "yearly"
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "border-transparent text-slate-600 hover:text-slate-800"
            }
            onClick={() => setBilling("yearly")}
          >
            Yearly (Save 20%)
          </Button>
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm ${
              plan.name === "Pro" ? "ring-2 ring-purple-200 shadow-md translate-y-[-4px]" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-left space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{plan.name}</p>
                <p className="text-xl font-bold text-slate-900">{plan.audience}</p>
                {plan.badge && (
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">
                    {plan.badge}
                  </span>
                )}
                {renderPrice(plan)}
              </div>
            </div>
            <div className="mt-auto pt-2">
              <Link href={plan.cta.href}>
                <Button
                  variant={plan.cta.variant}
                  className={
                    plan.cta.variant === "default"
                      ? "w-full bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                      : "w-full border border-slate-300 text-slate-600 hover:border-slate-400"
                  }
                >
                  {plan.cta.label}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-12 max-w-5xl space-y-4">
        <h2 className="text-center text-lg font-semibold text-slate-900">Compare plans in detail</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            <span>Feature</span>
            <span className="text-center">Free</span>
            <span className="text-center text-purple-700">Pro</span>
            <span className="text-center">Teams</span>
          </div>
          <div className="divide-y divide-slate-200 text-sm text-slate-700">
            {[
              { label: "Monthly study sets", values: ["20", "Unlimited", "Unlimited"] },
              { label: "Faster generation", values: ["–", "✓", "✓"] },
              { label: "Exam-format customization", values: ["–", "✓", "✓"] },
              { label: "Collaboration", values: ["–", "–", "✓"] },
              { label: "Admin & analytics", values: ["–", "–", "✓"] }
            ].map((row) => (
              <div key={row.label} className="grid grid-cols-4 px-4 py-3">
                <span>{row.label}</span>
                {row.values.map((val, idx) => (
                  <span key={idx} className="text-center">
                    {val}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 space-y-2 text-center text-sm text-slate-600">
        <p>No streaks. No pressure. Cancel anytime.</p>
        <p>Designed for focused exam prep.</p>
      </section>
    </main>
  );
}
