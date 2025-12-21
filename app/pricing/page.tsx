"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

const plans = [
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
    features: ["200 saves per month", "Priority generation", "Advanced customization", "Early access to new features"],
    cta: { label: "Upgrade", href: "/pricing/upgrade", variant: "default" }
  }
] as const;

export default function PricingPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-6 py-16 text-text-primary">
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Simple, transparent pricing.</h1>
        <p className="text-text-muted">
          StudyPilot is free to start. Upgrade only if you need more.
        </p>
      </section>

      <section className="mt-12 space-y-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="space-y-4 rounded-2xl border border-border bg-panel px-6 py-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-left">
                <p className="text-sm uppercase tracking-[0.16em] text-text-muted">{plan.name}</p>
                <p className="text-xl font-semibold">{plan.description}</p>
                {plan.priceMonthly && <p className="text-sm text-text-muted">{plan.priceMonthly}</p>}
                {plan.priceYearly && <p className="text-sm text-text-muted">{plan.priceYearly}</p>}
              </div>
              <Link href={plan.cta.href}>
                <Button
                  variant={plan.cta.variant}
                  className={plan.cta.variant === "default" ? "bg-accent text-[var(--text-on-accent)] hover:bg-accent-strong shadow-sm" : ""}
                >
                  {plan.cta.label}
                </Button>
              </Link>
            </div>
            <ul className="space-y-2 text-sm text-text-muted">
              {plan.features.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mt-10 space-y-2 text-center text-sm text-text-muted">
        <p>No streaks. No pressure. Cancel anytime.</p>
        <p>Designed for focused exam prep.</p>
      </section>
    </main>
  );
}
