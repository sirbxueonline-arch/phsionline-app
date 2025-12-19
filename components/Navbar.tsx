"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:border-text-primary hover:text-text-primary"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};

export const Navbar = () => {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOutUser } = useAuth();

  const isAuthed = !!user;
  const isLanding = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const authedLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/generate", label: "Generate" },
    { href: "/analytics", label: "Analytics" },
    { href: "/referrals", label: "Referrals" }
  ];
  const marketingLinks = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/pricing", label: "Pricing" }
  ];

  return (
    <header
      className={cn(
        "inset-x-0 top-0 z-50 w-full transition-colors",
        scrolled && "backdrop-blur-sm",
        isLanding ? "absolute" : "sticky"
      )}
      style={{
        backgroundColor: scrolled
          ? resolvedTheme === "dark"
            ? "rgba(15, 23, 42, 0.06)"
            : "rgba(247, 249, 252, 0.04)"
          : "transparent"
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-base font-semibold tracking-[0.01em] text-text-primary transition-colors hover:text-accent"
        >
          StudyPilot
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-3 text-sm font-medium text-text-muted md:flex">
            {(isAuthed ? authedLinks : marketingLinks).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1 transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthed ? (
              <>
                <Button
                  size="sm"
                  className="bg-accent text-[var(--text-on-accent)] shadow-sm hover:bg-accent-strong"
                  onClick={() => router.push("/pricing")}
                >
                  Upgrade
                </Button>
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-sm font-semibold text-text-primary shadow-sm ring-1 ring-border"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                  >
                    {(user?.email?.[0] || "U").toUpperCase()}
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-panel p-1 shadow-sm">
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface"
                        onClick={() => {
                          setMenuOpen(false);
                          router.push("/settings");
                        }}
                      >
                        Settings
                      </button>
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface"
                        onClick={() => {
                          setMenuOpen(false);
                          signOutUser();
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/#how-it-works"
                  className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
                >
                  How it works
                </Link>
                <Link
                  href="/pricing"
                  className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
                >
                  Pricing
                </Link>
                <Link
                  href="/auth/signin"
                  className="text-sm font-semibold text-text-primary transition-colors hover:text-accent"
                >
                  Log in
                </Link>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
