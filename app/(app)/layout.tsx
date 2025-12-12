import { Sidebar } from "@/components/Sidebar";
import { RequireAuth } from "@/components/RequireAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
        <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10">
          <Sidebar />
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
