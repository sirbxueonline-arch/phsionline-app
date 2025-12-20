"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import Image from "next/image";

const formatAuthError = (err: any) => {
  const code = err?.code || "";
  if (code.includes("email-already-in-use")) return "That email already has an account. Try signing in instead.";
  if (code.includes("weak-password")) return "Use a stronger password (8+ characters).";
  if (code.includes("network-request-failed")) return "Network issue—please retry once your connection is stable.";
  if (code.includes("operation-not-supported") || code.includes("popup-blocked"))
    return "This browser blocks pop-ups. Use the email form or try the Google redirect option.";
  if (code.includes("popup-closed-by-user")) return "The Google window was closed before completing. Please try again.";
  return err?.message || "We couldn't sign you up. Please try again.";
};

const maskEmail = (email: string) => {
  if (!email || !email.includes("@")) return "*****";
  const [userPart, domain] = email.split("@");
  return `${userPart[0] ?? ""}***@${domain}`;
};

export default function SignUpPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const refParam = searchParams.get("ref");

    const getCookieRef = () => {
      const match = document.cookie.match(/(?:^|; )referrer=([^;]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    };

    const stored = localStorage.getItem("studypilot_referrer");
    const ref = refParam || stored || getCookieRef();
    if (ref) {
      setReferralCode(ref);
      localStorage.setItem("studypilot_referrer", ref);
    }
  }, []);

  useEffect(() => {
    const fetchReferrer = async () => {
      if (!referralCode) return;
      try {
        const q = query(collection(db, "users"), where("referralCode", "==", referralCode));
        const snap = await getDocs(q);
        const docMatch = snap.docs?.[0];
        if (docMatch) {
          const data = docMatch.data();
          const name = (data?.name as string) || (data?.email as string)?.split("@")[0];
          setReferrerName(name || referralCode);
        } else {
          setReferrerName(referralCode);
        }
      } catch (err) {
        setReferrerName(referralCode);
      }
    };
    fetchReferrer();
  }, [referralCode]);

  const notifyReferral = async (refCode: string, name?: string, email?: string, joinedUserId?: string) => {
    try {
      await fetch("/api/referrals/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refCode,
          joinedName: name,
          joinedEmail: email,
          joinedUserId
        })
      });
    } catch (err) {
      console.error("Referral notify failed", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Use a stronger password (8+ characters)");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name });
      await setDoc(doc(db, "users", cred.user.uid), {
        name: form.name,
        email: form.email,
        createdAt: new Date().toISOString(),
        referralCode: cred.user.uid.slice(0, 8),
        referredBy: referralCode || null
      });
      if (referralCode) {
        void notifyReferral(referralCode, form.name || cred.user.email || undefined, form.email, cred.user.uid);
      }
      void fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email })
      }).catch(() => {});
      router.push("/onboarding");
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await setDoc(
        doc(db, "users", cred.user.uid),
        {
          name: cred.user.displayName || "",
          email: cred.user.email,
          createdAt: new Date().toISOString(),
          referralCode: cred.user.uid.slice(0, 8),
          referredBy: referralCode || null
        },
        { merge: true }
      );
      if (referralCode) {
        void notifyReferral(
          referralCode,
          cred.user.displayName || cred.user.email || undefined,
          cred.user.email || undefined,
          cred.user.uid
        );
      }
      if (cred.user.email) {
        void fetch("/api/email/welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cred.user.email })
        }).catch(() => {});
      }
      router.push("/onboarding");
    } catch (err: any) {
      if (err?.code?.includes("popup-blocked")) {
        router.push("/auth/google-redirect?intent=signup");
        return;
      }
      setError(formatAuthError(err));
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <div className="flex justify-center">
          <Image src="/logo.png" alt="StudyPilot logo" width={48} height={48} className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Create your account</h1>
        <p className="text-slate-600 dark:text-slate-200">Generate smarter study materials with AI.</p>
        {referrerName && (
          <p className="text-sm text-text-muted">You&apos;re being invited by {referrerName}.</p>
        )}
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="********"
          />
          <p className="text-xs text-slate-500 dark:text-slate-300">Use 8+ characters for a stronger password.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            required
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="********"
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-500/60 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        <div className="space-y-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
          <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogle} disabled={loading}>
            <Image src="/google.svg" alt="Google" width={18} height={18} className="h-4 w-4" />
            Continue with Google
          </Button>
        </div>
        <p className="text-center text-sm text-slate-600 dark:text-slate-200">
          Already have an account?{" "}
          <Link className="font-semibold text-cyan-600 underline dark:text-white" href="/auth/signin">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
