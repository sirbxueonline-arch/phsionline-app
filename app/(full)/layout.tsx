import { RequireAuth } from "@/components/RequireAuth";

export default function FullscreenLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        {children}
      </div>
    </RequireAuth>
  );
}
