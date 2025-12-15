"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Moon, Sun } from "lucide-react";

import { useAuth } from "./AuthProvider";
import { Button } from "./ui/button";
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

  const landingLinks = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#pricing", label: "Pricing" }
  ];

  const authedLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/generate", label: "Generate" },
    { href: "/library", label: "Library" },
    { href: "/analytics", label: "Analytics" }
  ];

  return (
    <header
      className={cn(
        "top-0 z-40 w-full transition-colors",
        isLanding
          ? "fixed border-transparent bg-white/80 text-slate-900 backdrop-blur-lg dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-100"
          : "sticky border-b border-slate-200/60 bg-white/85 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2 font-semibold">
            <Image src="/logo.svg" alt="StudyPilot logo" width={32} height={32} className="h-8 w-8" />
            <div className="leading-tight">
              <p className={cn("text-lg", isLanding && "text-slate-900 dark:text-slate-100")}>StudyPilot</p>
              <p
                className={cn(
                  "text-xs text-slate-500 dark:text-slate-400",
                  isLanding && "text-slate-500 dark:text-slate-400"
                )}
              >
                AI study cockpit
              </p>
            </div>
          </Link>
          <span className="hidden rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 sm:inline-flex">
            Live beta
          </span>
          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
            {(isAuthed ? authedLinks : landingLinks).map(({ href, label }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                active={pathname === href || pathname?.startsWith(href.replace("/#", ""))}
                landing={isLanding}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle landing={isLanding} />
          {isAuthed ? (
            <>
              <Link href="/generate" className="hidden md:block">
                <Button
                  size="sm"
                  className={cn(
                    "bg-gradient-to-r from-brand to-indigo-500 text-white shadow-md shadow-brand/30",
                    isLanding && "border border-slate-200/70 text-white dark:border-slate-800/70"
                  )}
                >
                  New study set
                </Button>
              </Link>
              <Link href="/upgrade">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    isLanding &&
                      "border-slate-300 text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900/60"
                  )}
                >
                  Upgrade
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className={cn(
                  isLanding && "text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900/60"
                )}
              >
                {user?.email?.split("@")[0] || "You"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOutUser}
                className={cn(
                  isLanding && "text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900/60"
                )}
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
                  className={cn(
                    "text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900/60",
                    isLanding && "text-slate-900"
                  )}
                >
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="sm"
                  className={cn(
                    "bg-gradient-to-r from-brand to-indigo-500 text-white shadow-md shadow-brand/30",
                    isLanding && "bg-white text-slate-900 hover:bg-slate-200 dark:bg-slate-200 dark:text-slate-900"
                  )}
                >
                  Start a study set
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
