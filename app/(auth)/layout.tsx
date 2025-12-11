import Link from "next/link";
import { CheckCircle2, Shield, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.14),transparent_35%)]" />
      <div className="relative mx-auto flex max-w-6xl items-center px-4 py-16">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur lg:block">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100 ring-1 ring-white/15">
              <Sparkles className="h-4 w-4" /> StudyPilot
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-white">
              AI-powered studying, synced across devices.
            </h1>
            <p className="mt-3 text-slate-200">
              Generate flashcards, quizzes, and plans, then save them to your library to review anywhere.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-100">
              {[
                { icon: <CheckCircle2 className="h-4 w-4 text-cyan-300" />, text: "Secure sign-in with Firebase Auth" },
                { icon: <CheckCircle2 className="h-4 w-4 text-cyan-300" />, text: "Supabase storage for your resources" },
                { icon: <Shield className="h-4 w-4 text-cyan-300" />, text: "End-to-end SSL and protected routes" }
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate-200">
              New here?{" "}
              <Link href="/auth/signup" className="font-semibold text-cyan-200 underline">
                Create an account
              </Link>
            </p>
          </div>

          <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
