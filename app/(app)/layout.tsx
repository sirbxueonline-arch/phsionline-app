import { RequireAuth } from "@/components/RequireAuth";
import Link from "next/link";
import { Notebook, Share2, Settings } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            {[
              { href: "/study", label: "Study", icon: Notebook },
              { href: "/referrals", label: "Referrals", icon: Share2 },
              { href: "/settings/profile", label: "Settings", icon: Settings }
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-2 font-medium shadow-sm transition hover:border-purple-200 hover:bg-purple-50 dark:border-slate-800/70 dark:bg-slate-900/70 dark:hover:border-purple-700/60 dark:hover:bg-slate-800"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
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
