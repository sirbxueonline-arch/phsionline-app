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
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10">
      <aside className="w-64 shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Settings</p>
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
                    ? "bg-slate-100 text-slate-900 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:ring-slate-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {children}
        </div>
      </div>
    </div>
  );
}
