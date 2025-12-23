"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Enter your email to get a reset link.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/email/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "We couldn't send the reset email. Please try again.");
      }
      setMessage("If that email is registered, we've sent a reset link.");
    } catch (err: any) {
      setError(err?.message || "We couldn't send the reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Reset your password</h1>
        <p className="text-slate-600 dark:text-slate-200">
          Enter your account email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-500/60 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {message && (
          <div className="flex items-center gap-2 rounded-md border border-emerald-500/60 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </div>
        )}

        <div className="space-y-3">
          <Button type="submit" className="w-full bg-[#7C3AED] text-white shadow-lg hover:bg-[#6c2fd0]" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Sending reset link...
              </span>
            ) : (
              "Send reset link"
            )}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/auth/signin")} disabled={loading}>
            Back to sign in
          </Button>
        </div>
      </form>
    </div>
  );
}
