import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900" />
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.14),transparent_35%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-16">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-white/5 dark:backdrop-blur">
          <div className="mb-6 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-cyan-100">
            <Sparkles className="h-4 w-4" />
            StudyPilot
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
