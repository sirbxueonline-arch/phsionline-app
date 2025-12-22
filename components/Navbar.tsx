"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut, Moon, Sun, Menu, X } from "lucide-react";

import { useAuth } from "./AuthProvider";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/useIsMobile";

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
  const isMobile = useIsMobile();

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
    { href: "/library", label: "Library" },
    { href: "/study", label: "Study" },
    { href: "/analytics", label: "Analytics" },
    { href: "/referrals", label: "Referrals" },
    { href: "/pricing", label: "Upgrade" }
  ];
  const marketingLinks = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/pricing", label: "Pricing" }
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full transition-colors backdrop-blur-sm border-b border-border/60",
        scrolled && "shadow-sm"
      )}
      style={{
        backgroundColor: scrolled
          ? resolvedTheme === "dark"
            ? "rgba(15, 23, 42, 0.78)"
            : "rgba(247, 249, 252, 0.88)"
          : resolvedTheme === "dark"
          ? "rgba(15, 23, 42, 0.78)"
          : "rgba(247, 249, 252, 0.9)"
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-[0.01em] text-text-primary transition-colors hover:text-accent"
        >
          <Image src="/logo.svg" alt="StudyPilot logo" width={28} height={28} className="h-7 w-7" />
          <span className="sr-only">StudyPilot</span>
        </Link>

        <div className="hidden flex-1 items-center gap-6 md:flex">
          <nav className="flex flex-1 items-center justify-center gap-8 text-sm font-medium text-text-muted">
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
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm font-semibold text-text-primary transition-colors hover:text-accent"
              >
                Log in
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-text-primary shadow-sm dark:bg-slate-900"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-panel shadow-sm">
          <nav className="flex flex-col gap-1 px-4 py-3 text-sm font-medium text-text-primary">
            {(isAuthed ? authedLinks : marketingLinks).map((link) => (
              <button
                key={link.href}
                className="rounded-lg px-3 py-2 text-left hover:bg-surface"
                onClick={() => {
                  setMenuOpen(false);
                  router.push(link.href);
                }}
              >
                {link.label}
              </button>
            ))}
            {isAuthed ? (
              <>
                <button
                  className="rounded-lg px-3 py-2 text-left hover:bg-surface"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/settings");
                  }}
                >
                  Settings
                </button>
                <button
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setMenuOpen(false);
                    signOutUser();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <button
                className="rounded-lg px-3 py-2 text-left hover:bg-surface"
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/auth/signin");
                }}
              >
                Log in
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
