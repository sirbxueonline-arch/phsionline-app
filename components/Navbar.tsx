"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { Sun, Moon, LogOut } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const ThemeToggle = ({ landing = false }: { landing?: boolean }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Toggle theme"
      className={cn(landing && "text-white hover:bg-white/10")}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOutUser } = useAuth();

  const isAuthed = !!user;
  const isLanding = pathname === "/";

  return (
    <header
      className={cn(
        "top-0 z-40 w-full transition-colors",
        isLanding
          ? "fixed border-transparent bg-transparent text-slate-900 backdrop-blur-none dark:border-slate-800/80 dark:bg-slate-950/70 dark:text-slate-100"
          : "sticky border-b border-slate-200/60 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2 font-semibold">
            <Image src="/logo.svg" alt="StudyPilot logo" width={32} height={32} className="h-8 w-8" />
            <div className="leading-tight">
              <p className={cn("text-lg", isLanding && "text-slate-900 dark:text-slate-100")}>StudyPilot</p>
              <p className={cn("text-xs text-slate-500 dark:text-slate-400", isLanding && "text-slate-500 dark:text-slate-400")}>
                AI study cockpit
              </p>
            </div>
          </Link>
          <span className="hidden rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 sm:inline-flex">
            Live beta
          </span>
          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
            <NavLink href="/dashboard" label="Dashboard" active={pathname?.startsWith("/dashboard")} landing={isLanding} />
            <NavLink href="/generate" label="Generate" active={pathname?.startsWith("/generate")} landing={isLanding} />
          <NavLink href="/library" label="Library" active={pathname?.startsWith("/library")} landing={isLanding} />
          <NavLink href="/analytics" label="Analytics" active={pathname?.startsWith("/analytics")} landing={isLanding} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle landing={isLanding} />
        <Link href="/generate" className="hidden md:block">
          <Button
            size="sm"
            className={cn(
              "bg-gradient-to-r from-brand to-indigo-500 text-white shadow-md shadow-brand/30",
              isLanding && "border border-slate-200/70 text-white dark:border-slate-800/70"
            )}
          >
            New generation
          </Button>
        </Link>
        <Link href="/upgrade">
          <Button
            variant="outline"
            size="sm"
            className={cn(isLanding && "border-slate-300 text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900/60")}
          >
            Upgrade
          </Button>
        </Link>
        {isAuthed ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className={cn(isLanding && "text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900/60")}
            >
              {user?.email?.split("@")[0] || "You"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOutUser}
              className={cn(isLanding && "text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900/60")}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Link href="/auth/signin">
              <Button
                variant="ghost"
                size="sm"
                className={cn(isLanding && "text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900/60")}
              >
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                size="sm"
                className={cn(isLanding && "bg-white text-slate-900 hover:bg-slate-200 dark:bg-slate-200 dark:text-slate-900")}
              >
                Sign up
              </Button>
            </Link>
          </>
        )}
      </div>
      </div>
    </header>
  );
};

const NavLink = ({
  href,
  label,
  active,
  landing
}: {
  href: string;
  label: string;
  active: boolean;
  landing?: boolean;
}) => (
  <Link
    href={href}
    className={cn(
      "rounded-md px-2 py-1 transition-colors hover:text-slate-900 dark:hover:text-slate-100",
      active ? "text-slate-900 dark:text-slate-100" : "text-slate-500",
      landing &&
        (active
          ? "text-slate-900 dark:text-slate-100"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100")
    )}
  >
    {label}
  </Link>
);
