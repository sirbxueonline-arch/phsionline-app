"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

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
      await new Promise((res) => setTimeout(res, 1200));
      setSuccess(true);
    } catch (err) {
      console.error("Billing demo write failed", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Upgrade to Pro (demo)</h1>
        <p className="text-slate-600 dark:text-slate-300">
          This is a mock checkout. No payment will be processed. Unlock unlimited generations soon.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-brand/40">
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Stay on the free plan with monthly 20 saves.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">$0</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>✔ 20 saves per month</li>
              <li>✔ Generate flashcards, quizzes, explanations</li>
              <li>✔ Basic analytics</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="border-2 border-brand shadow-lg">
          <CardHeader>
            <CardTitle>Pro (Coming soon)</CardTitle>
            <CardDescription>Unlimited saves and faster AI responses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-4xl font-semibold">$12<span className="text-base font-medium">/mo</span></p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>✔ Unlimited generations & saves</li>
              <li>✔ Priority AI models</li>
              <li>✔ Advanced analytics & exports</li>
              <li>✔ Early access features</li>
            </ul>
            <Button className="w-full" onClick={() => setOpen(true)}>
              Upgrade to Pro
            </Button>
            <p className="text-xs text-slate-500">Demo checkout — no payment will be processed.</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demo Checkout</DialogTitle>
            <DialogDescription>Payments coming soon. Enter mock details to preview the flow.</DialogDescription>
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
              {processing ? "Processing..." : "Pay"}
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
