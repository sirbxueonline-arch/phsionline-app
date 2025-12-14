import Link from "next/link";
import { CheckCircle2, Shield, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900" />
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.14),transparent_35%)]" />
      <div className="relative mx-auto flex max-w-6xl items-center px-4 py-16">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-xl lg:block dark:border-white/10 dark:bg-white/5 dark:backdrop-blur">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 ring-1 ring-slate-200 dark:bg-white/10 dark:text-cyan-100 dark:ring-white/15">
              <Sparkles className="h-4 w-4" /> StudyPilot
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 dark:text-white">
              AI-powered studying, synced across devices.
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-200">
              Generate flashcards, quizzes, and plans, then save them to your library to review anywhere.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-100">
              {[
                { icon: <CheckCircle2 className="h-4 w-4 text-slate-500 dark:text-cyan-300" />, text: "Secure sign-in with Firebase Auth" },
                { icon: <CheckCircle2 className="h-4 w-4 text-slate-500 dark:text-cyan-300" />, text: "Supabase storage for your resources" },
                { icon: <Shield className="h-4 w-4 text-slate-500 dark:text-cyan-300" />, text: "End-to-end SSL and protected routes" }
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5"
                >
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate-600 dark:text-slate-200">
              New here?{" "}
              <Link href="/auth/signup" className="font-semibold text-cyan-600 underline dark:text-cyan-200">
                Create an account
              </Link>
            </p>
          </div>

          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-white/5 dark:backdrop-blur">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
