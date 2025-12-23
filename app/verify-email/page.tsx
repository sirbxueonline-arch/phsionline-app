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
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [initialSend, setInitialSend] = useState(false);

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

  const sendCode = async () => {
    if (!user?.email) {
      setError("No email found on your account.");
      return;
    }
    setSending(true);
    setMessage(null);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/email/verify-code/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: user.email })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to send code");
      }
      setMessage("Code sent. Check your inbox for the 6-digit code.");
    } catch (err: any) {
      setError(err?.message || "Failed to send code.");
    } finally {
      setSending(false);
      setInitialSend(true);
    }
  };

  useEffect(() => {
    if (!loading && user && !user.emailVerified && !initialSend) {
      void sendCode();
    }
  }, [loading, user, initialSend]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Enter the 6-digit code.");
      return;
    }
    setVerifying(true);
    setError(null);
    setMessage(null);
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/email/verify-code/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: code.trim() })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Invalid code");
      }
      setMessage("Email verified. Redirecting...");
      await user?.reload();
      router.refresh();
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to verify code.");
    } finally {
      setVerifying(false);
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
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-slate-900 dark:text-white">{user.email}</span>.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleVerify}>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Verification code
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-lg tracking-[0.3em] text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="123456"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={verifying} className="w-full sm:w-auto">
              {verifying ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                </span>
              ) : (
                "Verify code"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={sendCode} disabled={sending} className="w-full sm:w-auto">
              {sending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                </span>
              ) : (
                "Resend code"
              )}
            </Button>
          </div>
        </form>

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
          Didn’t get the code? Check spam, or resend the code.
        </p>
      </div>
    </div>
  );
}
