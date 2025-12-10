import { RequireAuth } from "@/components/RequireAuth";

export default function FullscreenLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
        {children}
      </div>
    </RequireAuth>
  );
}
