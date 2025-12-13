"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Sparkles } from "lucide-react";
import Image from "next/image";

export default function SignUpPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

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
        referralCode: cred.user.uid.slice(0, 8)
      });
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        await setDoc(
          doc(db, "users", result.user.uid),
          {
            name: result.user.displayName,
            email: result.user.email,
            createdAt: new Date().toISOString(),
            referralCode: result.user.uid.slice(0, 8)
          },
          { merge: true }
        );
      }
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Google sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-brand" />
        <h1 className="text-3xl font-semibold">Create your account</h1>
        <p className="text-slate-200">Generate smarter study materials with AI.</p>
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
            placeholder="••••••••"
          />
          <p className="text-xs text-slate-300">Use 8+ characters for a stronger password.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            required
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="••••••••"
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
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
        <p className="text-center text-sm text-slate-200">
          Already have an account?{" "}
          <Link className="font-semibold text-white underline" href="/auth/signin">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
