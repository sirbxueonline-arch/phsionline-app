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
      className={cn(
        "text-[var(--text-primary)] hover:bg-[var(--surface)] focus-visible:ring-[var(--accent)] focus-visible:ring-offset-[var(--bg)]",
        landing && "border border-[var(--border)]"
      )}
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
        "fixed top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--nav)] text-[var(--text-primary)] backdrop-blur-xl transition-colors"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2 font-semibold">
            <Image src="/logo.svg" alt="StudyPilot logo" width={32} height={32} className="h-8 w-8" />
            <div className="leading-tight">
              <p className="text-lg text-[var(--text-primary)]">StudyPilot</p>
              <p className="text-xs text-[var(--text-muted)]">Structured exam prep</p>
            </div>
          </Link>
          <span className="hidden rounded-full border border-[#22C55E] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#22C55E] sm:inline-flex">
            Stable build
          </span>
          <div className="hidden items-center gap-2 text-sm text-[var(--text-muted)] sm:flex">
            {(isAuthed ? authedLinks : landingLinks).map(({ href, label }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                active={pathname === href || pathname?.startsWith(href.replace("/#", ""))}
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
                  className="bg-[var(--accent)] text-[var(--text-primary)] shadow-md shadow-[var(--bg)] hover:bg-[var(--accent-strong)]"
                >
                  New study set
                </Button>
              </Link>
              <Link href="/upgrade">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[var(--accent)] text-[var(--text-primary)] hover:bg-[var(--surface)]"
                >
                  Upgrade
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="text-[var(--text-primary)] hover:bg-[var(--surface)]"
              >
                {user?.email?.split("@")[0] || "You"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOutUser}
                className="text-[var(--text-primary)] hover:bg-[var(--surface)]"
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
                  className="text-[var(--text-primary)] hover:bg-[var(--surface)]"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="sm"
                  className="bg-[var(--accent)] text-[var(--text-primary)] shadow-md shadow-[var(--bg)] hover:bg-[var(--accent-strong)]"
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
  active
}: {
  href: string;
  label: string;
  active: boolean;
}) => (
  <Link
    href={href}
    className={cn(
      "rounded-md px-2 py-1 text-sm transition-colors",
      active ? "bg-[var(--surface)] text-[var(--text-primary)]" : "text-[var(--text-muted)]",
      "hover:text-[var(--text-primary)]"
    )}
  >
    {label}
  </Link>
);
