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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm">
      <div className="flex h-[80vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Settings</h2>
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
                    "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors",
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
        <div className="flex-1 overflow-y-auto bg-white px-8 py-6 dark:bg-slate-900">
          <div className="max-w-3xl space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
