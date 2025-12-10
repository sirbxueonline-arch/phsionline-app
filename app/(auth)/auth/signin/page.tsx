"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Sparkles } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-brand" />
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="text-slate-200">Sign in to access your StudyPilot cockpit.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSignIn}>
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
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
            Continue with Google
          </Button>
        </div>
        <p className="text-center text-sm text-slate-200">
          No account?{" "}
          <Link className="font-semibold text-white underline" href="/auth/signup">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
