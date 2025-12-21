"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/preferences", label: "Preferences" },
  { href: "/settings/study-config", label: "Study Config" },
  { href: "/settings/export", label: "Data Export" },
  { href: "/settings/feedback", label: "Feedback" }
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTab = tabs.find((t) => pathname?.startsWith(t.href))?.href || tabs[0].href;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 px-4 py-10 backdrop-blur-sm">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_35%),_radial-gradient(circle_at_20%_20%,_rgba(14,165,233,0.12),_transparent_30%)]" />
      <div className="relative flex h-[82vh] w-full max-w-6xl overflow-hidden rounded-[28px] bg-gradient-to-br from-white to-slate-50 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.3)] ring-1 ring-slate-200 dark:from-slate-900 dark:to-slate-950 dark:ring-slate-800">
        <button
          type="button"
          aria-label="Close settings"
          onClick={() => window.history.back()}
          className="absolute right-4 top-4 z-10 rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-50"
        >
          ✕
        </button>
        <aside className="w-68 shrink-0 border-r border-slate-200/80 bg-slate-50/80 px-6 py-8 backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-900/60">
          <div className="mb-8 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Settings
            </p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Control center</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Manage your account and preferences.</p>
          </div>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:ring-slate-700"
                      : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="flex-1 overflow-y-auto px-10 py-8">
          <div className="max-w-3xl space-y-6 rounded-2xl bg-white/70 p-1 backdrop-blur-sm dark:bg-slate-900/70">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
