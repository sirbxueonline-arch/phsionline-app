"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutGrid, Library, LineChart, Wand2, Notebook, Share2, Settings } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/generate", label: "Generate", icon: Wand2 },
  { href: "/library", label: "Library", icon: Library },
  { href: "/study", label: "Study", icon: Notebook },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/referrals", label: "Referrals", icon: Share2 },
  { href: "/settings/profile", label: "Settings", icon: Settings }
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 flex-shrink-0 border-r border-slate-200/60 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/60 lg:block">
      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900",
                active
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-50"
                  : "text-slate-600 dark:text-slate-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
