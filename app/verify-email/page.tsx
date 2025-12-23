"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/signin");
      return;
    }
    if (user.emailVerified) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  const handleResend = async () => {
    if (!user?.email) {
      setError("No email found on your account.");
      return;
    }
    setSending(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to send verification email");
      }
      setMessage("Verification email sent. Check your inbox for the link.");
    } catch (err: any) {
      setError(err?.message || "Failed to send verification email.");
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await user?.reload();
      router.refresh();
    } catch (err) {
      console.error("Failed to refresh user", err);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Checking account...
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-white/10 dark:bg-slate-900/70">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Verify your email</h1>
          <p className="text-slate-600 dark:text-slate-300">
            We sent a verification link to <span className="font-semibold text-slate-900 dark:text-white">{user.email}</span>.
            Please click it to unlock your workspace.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button onClick={handleResend} disabled={sending} className="w-full sm:w-auto">
            {sending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Sending...
              </span>
            ) : (
              "Resend verification email"
            )}
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="w-full sm:w-auto">
            I've verified—refresh status
          </Button>
        </div>

        {message && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-emerald-500/60 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-red-500/60 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <p className="mt-6 text-sm text-slate-500 dark:text-slate-300">
          Didn’t get the email? Check your spam folder or add support@studypilot.online to your contacts.
        </p>
      </div>
    </div>
  );
}
