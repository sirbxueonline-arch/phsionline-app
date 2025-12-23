"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const formatResetError = (err: any) => {
  const code = err?.code || "";
  if (code.includes("expired") || code.includes("invalid-action-code")) {
    return "This reset link is invalid or expired. Please request a new one.";
  }
  if (code.includes("weak-password")) return "Use a stronger password (8+ characters).";
  if (code.includes("network-request-failed")) return "Network issue - retry when your connection is stable.";
  return err?.message || "We couldn't reset your password. Please try again.";
};

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = useMemo(() => searchParams.get("oobCode") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!oobCode) {
        setError("Invalid or missing reset code. Please request a new link.");
        setVerifying(false);
        return;
      }
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setError(null);
      } catch (err: any) {
        setError(formatResetError(err));
      } finally {
        setVerifying(false);
      }
    };
    verify();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifying || submitting) return;
    if (!password || password.length < 8) {
      setError("Use a stronger password (8+ characters).");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setMessage("Password updated. You can sign in with your new password.");
    } catch (err: any) {
      setError(formatResetError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking your reset link...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Set a new password</h1>
        <p className="text-slate-600 dark:text-slate-200">Enter and confirm your new password to finish resetting.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
            <p className="text-xs text-slate-500 dark:text-slate-300">Use 8+ characters for a stronger password.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="********"
            />
          </div>
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
          <Button
            type="submit"
            className="w-full bg-[#7C3AED] text-white shadow-lg hover:bg-[#6c2fd0]"
            disabled={submitting || !!message}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Updating password...
              </span>
            ) : (
              "Update password"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/auth/signin")}
            disabled={submitting}
          >
            Back to sign in
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm text-slate-600 hover:text-slate-800 dark:text-slate-200"
            onClick={() => router.push("/forgotpassword")}
            disabled={submitting}
          >
            Need a new link?
          </Button>
        </div>
      </form>
    </div>
  );
}
