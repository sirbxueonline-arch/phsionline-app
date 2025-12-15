"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { getRedirectResult, signInWithRedirect } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { auth, googleProvider } from "@/lib/firebase";

const formatAuthError = (err: any) => {
  const code = err?.code || "";
  if (code.includes("popup-blocked") || code.includes("operation-not-supported")) {
    return "This browser blocks pop-ups. Try email instead or switch to a modern browser.";
  }
  if (code.includes("network-request-failed")) {
    return "Network issue—please retry once your connection is stable.";
  }
  return err?.message || "We couldn't reach Google right now. Please try again.";
};

export default function GoogleRedirectPage() {
  const router = useRouter();
  const params = useSearchParams();
  const intent = useMemo(() => (params.get("intent") === "signup" ? "signup" : "signin"), [params]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          if (intent === "signup") {
            router.replace("/onboarding");
          } else {
            router.replace("/dashboard");
          }
          return;
        }
        await signInWithRedirect(auth, googleProvider);
      } catch (err: any) {
        setError(formatAuthError(err));
        setLoading(false);
      }
    };
    startRedirect();
  }, [intent, router]);

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Connecting you to Google to {intent === "signup" ? "create your account" : "log in"}
        </h1>
        <p className="text-slate-600 dark:text-slate-200">
          We&apos;re opening Google on a secure page. If it doesn&apos;t open, use the email option or try again.
        </p>
      </div>

      {error ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 rounded-md border border-red-500/60 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/auth/signin">
              <Button variant="outline">Back to sign in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="ghost">Try email instead</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200">
          <Loader2 className="h-5 w-5 animate-spin" />
          {loading ? "Opening Google..." : "Taking you to Google..."}
        </div>
      )}
    </div>
  );
}
