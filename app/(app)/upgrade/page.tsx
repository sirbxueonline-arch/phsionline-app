"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Shield, Zap, Users } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

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
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const fakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setSuccess(false);
    try {
      if (user) {
        await addDoc(collection(db, "billingAttempts"), {
          uid: user.uid,
          plan: "pro",
          status: "demo",
          createdAt: new Date().toISOString()
        });
      }
      await new Promise((res) => setTimeout(res, 1000));
      setSuccess(true);
    } catch (err) {
      console.error("Billing demo write failed", err);
    } finally {
      setProcessing(false);
    }
  };

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
                onClick={() => {
                  if (plan.action === "pro") setOpen(true);
                }}
                disabled={plan.action !== "pro"}
              >
                {plan.cta}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demo checkout</DialogTitle>
            <DialogDescription>Payments are mocked while Pro rolls out.</DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={fakeSubmit}>
            <div className="space-y-1">
              <Label htmlFor="card">Card number</Label>
              <Input id="card" placeholder="4242 4242 4242 4242" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="exp">Expiry</Label>
                <Input id="exp" placeholder="12/34" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" required />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="name">Name on card</Label>
              <Input id="name" placeholder="Ada Lovelace" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="USA" required />
            </div>
            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? "Processing..." : "Pay (demo)"}
            </Button>
            {success && (
              <p className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-200">
                Demo success! This is a mock checkout. Payments are coming soon.
              </p>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
