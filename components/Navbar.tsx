"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Moon, Sun } from "lucide-react";

import { useAuth } from "./AuthProvider";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      aria-label="Toggle theme"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:border-text-primary hover:text-text-primary"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOutUser } = useAuth();

  const isAuthed = !!user;
  const isLanding = pathname === "/";

  const authedLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/generate", label: "Generate" },
    { href: "/analytics", label: "Analytics" }
  ];
  const marketingLinks = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#pricing", label: "Pricing" }
  ];

  return (
    <header
      className={cn(
        "inset-x-0 top-0 z-50 w-full",
        isLanding ? "absolute bg-transparent" : "sticky bg-panel/80 backdrop-blur border-b border-border"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-text-primary transition-colors hover:text-accent"
        >
          StudyPilot
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-3 text-sm font-medium text-text-muted md:flex">
            {(isAuthed ? authedLinks : marketingLinks).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1 transition-colors hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {isAuthed ? (
            <>
              <Button
                size="sm"
                className="hidden md:inline-flex bg-accent text-[var(--text-on-accent)] hover:bg-accent-strong"
                onClick={() => router.push("/pricing")}
              >
                Upgrade
              </Button>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm font-medium text-text-primary transition-colors hover:text-accent"
                type="button"
              >
              Dashboard
            </button>
              <Button
                variant="secondary"
                size="sm"
                onClick={signOutUser}
                className="text-sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-text-primary transition-colors hover:text-accent"
            >
              Log in
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
