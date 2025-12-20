import { RequireAuth } from "@/components/RequireAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50 overflow-y-auto">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
          <main className="flex-1">
            <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-xl backdrop-blur-sm transition-colors dark:border-slate-800/70 dark:bg-slate-900/70">
              <div className="p-6 sm:p-8">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
