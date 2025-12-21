"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type Plan = {
  name: string;
  description: string;
  priceMonthly?: string;
  priceYearly?: string;
  badge?: string;
  features: string[];
  cta: { label: string; href: string; variant: "default" | "secondary" };
};

const plans: Plan[] = [
  {
    name: "Free",
    description: "Start with the essentials.",
    features: ["20 saves per month", "Flashcards, quizzes, study plans", "Smart defaults", "Access to dashboard"],
    cta: { label: "Continue free", href: "/auth/signup", variant: "secondary" }
  },
  {
    name: "Pro",
    description: "For consistent exam prep.",
    priceMonthly: "$10/mo",
    priceYearly: "$96/yr (save 20%)",
    badge: "Most popular",
    features: [
      "200 saves per month",
      "Priority generation (faster, more accurate)",
      "Advanced customization for flashcards/quiz",
      "Early access to new features"
    ],
    cta: { label: "Upgrade", href: "/pricing/upgrade", variant: "default" }
  },
  {
    name: "Teams",
    description: "For study groups, classrooms, and small teams.",
    priceMonthly: "$18/user/mo",
    priceYearly: "$180/user/yr (save 17%)",
    features: [
      "Shared libraries & collaboration",
      "Admin controls & permissions",
      "Team analytics and usage insights",
      "Priority support and onboarding"
    ],
    cta: { label: "Contact sales", href: "/pricing/contact", variant: "default" }
  }
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const renderPrice = (plan: Plan) => {
    if (plan.name === "Free") return <p className="text-3xl font-semibold text-slate-900">Free</p>;
    const price = billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
    return <p className="text-2xl font-semibold text-slate-900">{price}</p>;
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
            Yearly
          </Button>
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="relative flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-left space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{plan.name}</p>
                <p className="text-xl font-bold text-slate-900">{plan.description}</p>
                {plan.badge && (
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">
                    {plan.badge}
                  </span>
                )}
                {renderPrice(plan)}
              </div>
            </div>
            {plan.name !== "Free" && (
              <p className="text-sm text-slate-700">
                Unlock faster generations, richer customization, and premium support built for serious learners.
              </p>
            )}
            <ul className="space-y-2 text-sm text-slate-600">
              {plan.features.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-2">
              <Link href={plan.cta.href}>
                <Button
                  variant={plan.cta.variant}
                  className={
                    plan.cta.variant === "default"
                      ? "w-full bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                      : "w-full border border-slate-300 text-slate-700 hover:border-slate-400"
                  }
                >
                  {plan.cta.label}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-10 space-y-2 text-center text-sm text-slate-600">
        <p>No streaks. No pressure. Cancel anytime.</p>
        <p>Designed for focused exam prep.</p>
      </section>
    </main>
  );
}
