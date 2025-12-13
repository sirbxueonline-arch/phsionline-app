"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Shield, Zap, Users } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useSearchParams } from "next/navigation";

type Plan = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  badge?: string;
  action: "free" | "pro" | "contact";
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    description: "Start fast with monthly limits.",
    features: ["20 saves per month", "Flashcards, quizzes, plans", "Basic analytics"],
    cta: "Stay on Free",
    action: "free"
  },
  {
    name: "Pro",
    price: "$12",
    period: "/mo",
    description: "More generations and faster AI.",
    features: ["Unlimited generations (coming soon)", "Priority Gemini/OpenAI models", "Advanced analytics & export"],
    cta: "Upgrade to Pro",
    badge: "Coming soon",
    action: "pro"
  },
  {
    name: "Team",
    price: "Talk to us",
    description: "Workspace controls and shared credits.",
    features: ["Seat-based pricing", "Centralized billing & SSO", "Support and onboarding"],
    cta: "Contact sales",
    action: "contact"
  }
];

export default function UpgradePage() {
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
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900/70 dark:text-slate-200 dark:ring-slate-800">
          <Shield className="h-4 w-4" /> Pricing
        </div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">Pick a plan that fits your study flow</h1>
        <p className="max-w-3xl text-slate-600 dark:text-slate-300">
          Start free, upgrade when you need more generations. Payments are mocked for now; Pro and Team are in rollout.
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
            <Zap className="h-4 w-4 text-purple-600" />
            Powered by priority AI models
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
            <Users className="h-4 w-4 text-indigo-600" />
            Team workspaces coming soon
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
            className="relative rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70"
          >
            {plan.badge && (
              <span className="absolute right-4 top-4 rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/50 dark:text-purple-100 dark:ring-purple-800/60">
                {plan.badge}
              </span>
            )}
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl text-slate-900 dark:text-slate-50">{plan.name}</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-1 text-4xl font-semibold text-slate-900 dark:text-slate-50">
                {plan.price}
                {plan.period && <span className="text-base font-medium text-slate-500 dark:text-slate-300">{plan.period}</span>}
              </div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-purple-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.name === "Pro" ? "default" : "outline"}
                onClick={() => startCheckout(plan)}
                disabled={plan.action !== "pro" || !!processingPlan}
              >
                {processingPlan === plan.name ? "Redirecting..." : plan.cta}
              </Button>
              {plan.action !== "pro" && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {plan.action === "contact" ? "Drop us a note; team billing opens soon." : "You're on this plan."}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
