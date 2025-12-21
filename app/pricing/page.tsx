"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Shield, Zap, Users, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useSearchParams } from "next/navigation";

type Plan = {
  name: string;
  headline: string;
  price: string;
  interval: string;
  footnote?: string;
  features: string[];
  cta: string;
  badge?: string;
  action: "free" | "pro" | "contact";
};

const plans: Plan[] = [
  {
    name: "Free",
    headline: "Try StudyPilot - light review",
    price: "$0",
    interval: "No card needed",
    footnote: "Limited monthly study sets",
    features: ["Flashcards, quizzes, study plans", "Great for occasional review", "Upgrade when you study daily"],
    cta: "Stay on Free",
    action: "free"
  },
  {
    name: "Pro",
    headline: "Daily exam prep without limits",
    price: "$8",
    interval: "per month, billed yearly (save 20%)",
    footnote: "Cancel anytime. No lock-in.",
    features: ["Unlimited study sets", "Higher-quality, faster generation", "Match your exact exam format"],
    cta: "Start Pro",
    badge: "Most popular",
    action: "pro"
  },
  {
    name: "Team",
    headline: "For shared libraries & analytics (5+ users)",
    price: "$15",
    interval: "per user / month, billed yearly",
    footnote: "Seat-based pricing. Priority support.",
    features: ["Shared libraries & collaboration", "Admin controls & permissions", "Team analytics and insights"],
    cta: "Contact sales",
    action: "contact"
  }
];

export default function PricingPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusMessage = useMemo(() => {
    const status = searchParams?.get("status");
    if (status === "success") return "Payment successful! Your Pro access will activate shortly.";
    if (status === "cancelled") return "Checkout cancelled. You can try again anytime.";
    return null;
  }, [searchParams]);

  const startCheckout = async (plan: Plan) => {
    if (plan.action !== "pro") return;

    if (!user) {
      setError("Please sign in before upgrading.");
      return;
    }

    setProcessingPlan(plan.name);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.name.toLowerCase() })
      });
      if (!res.ok) {
        throw new Error("Failed to start checkout. Please try again.");
      }
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url as string;
      } else {
        throw new Error("No checkout URL returned.");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
      setProcessingPlan(null);
    }
  };

  useEffect(() => {
    if (!processingPlan) return;
    const timeout = setTimeout(() => setProcessingPlan(null), 15000);
    return () => clearTimeout(timeout);
  }, [processingPlan]);

  return (
    <div className="space-y-10">
      <header className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900/70 dark:text-slate-200 dark:ring-slate-800">
          <Shield className="h-4 w-4" /> Plans
        </div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">Choose how you want to study</h1>
        <p className="mx-auto max-w-3xl text-slate-600 dark:text-slate-300">
          Pick the plan that fits your study pace. Payments are mocked for now — Pro unlocks unlimited study sets and higher-quality
          generation when you need it.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
            <Zap className="h-4 w-4 text-purple-600" />
            Faster, higher-quality generation
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
            <Users className="h-4 w-4 text-indigo-600" />
            Teams for shared libraries & analytics
          </span>
        </div>
      </header>

      {statusMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-100">
          {statusMessage}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70 ${
              plan.name === "Pro" ? "ring-2 ring-purple-200 shadow-md translate-y-[-4px]" : ""
            }`}
          >
            {plan.badge && (
              <span className="absolute right-4 top-4 rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/50 dark:text-purple-100 dark:ring-purple-800/60">
                {plan.badge}
              </span>
            )}
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl text-slate-900 dark:text-slate-50">{plan.name}</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">{plan.headline}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="space-y-1">
                <div className="flex items-end gap-2 text-4xl font-semibold text-slate-900 dark:text-slate-50">
                  {plan.price}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{plan.interval}</p>
                {plan.footnote && <p className="text-xs text-slate-500 dark:text-slate-400">{plan.footnote}</p>}
              </div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-purple-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto space-y-2">
                {plan.action === "contact" ? (
                  <Link href="mailto:hello@studypilot.online" className="block">
                    <Button
                      className="w-full bg-purple-600 text-white hover:bg-purple-700"
                      variant="default"
                      type="button"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className={`w-full ${plan.name === "Pro" ? "bg-purple-600 text-white hover:bg-purple-700" : ""}`}
                    variant={plan.name === "Pro" ? "default" : "outline"}
                    onClick={() => startCheckout(plan)}
                    disabled={(plan.action !== "pro" && plan.action !== "free") || !!processingPlan || plan.action === "free"}
                  >
                    {processingPlan === plan.name ? "Redirecting..." : plan.cta}
                  </Button>
                )}
                {plan.action === "pro" && (
                  <p className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    Cancel anytime
                    <ArrowRight className="h-3 w-3" />
                    No lock-in
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
