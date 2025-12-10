import { Sidebar } from "@/components/Sidebar";
import { RequireAuth } from "@/components/RequireAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
        <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
          <Sidebar />
          <main className="w-full lg:ml-4 lg:max-w-4xl">
            <div className="rounded-2xl bg-white/5 p-1 backdrop-blur">
              <div className="rounded-2xl bg-slate-50/80 p-6 text-slate-900 shadow-xl dark:bg-slate-950/60 dark:text-slate-50">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
