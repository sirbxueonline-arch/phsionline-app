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
        "text-[#E5E7EB] hover:bg-[#111827] focus-visible:ring-[#4F46E5] focus-visible:ring-offset-[#0F172A]",
        landing && "border border-[#111827]"
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
        "fixed top-0 z-40 w-full border-b border-[#111827] bg-[#0F172A]/90 text-[#E5E7EB] backdrop-blur-xl transition-colors"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2 font-semibold">
            <Image src="/logo.svg" alt="StudyPilot logo" width={32} height={32} className="h-8 w-8" />
            <div className="leading-tight">
              <p className="text-lg text-[#E5E7EB]">StudyPilot</p>
              <p className="text-xs text-[#9CA3AF]">Structured exam prep</p>
            </div>
          </Link>
          <span className="hidden rounded-full border border-[#22C55E] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#22C55E] sm:inline-flex">
            Stable build
          </span>
          <div className="hidden items-center gap-2 text-sm text-[#9CA3AF] sm:flex">
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
                  className="bg-[#4F46E5] text-[#E5E7EB] shadow-md shadow-[#0F172A] hover:bg-[#7C3AED]"
                >
                  New study set
                </Button>
              </Link>
              <Link href="/upgrade">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#4F46E5] text-[#E5E7EB] hover:bg-[#111827]"
                >
                  Upgrade
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="text-[#E5E7EB] hover:bg-[#111827]"
              >
                {user?.email?.split("@")[0] || "You"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOutUser}
                className="text-[#E5E7EB] hover:bg-[#111827]"
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
                  className="text-[#E5E7EB] hover:bg-[#111827]"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="sm"
                  className="bg-[#4F46E5] text-[#E5E7EB] shadow-md shadow-[#0F172A] hover:bg-[#7C3AED]"
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
      active ? "bg-[#111827] text-[#E5E7EB]" : "text-[#9CA3AF]",
      "hover:text-[#E5E7EB]"
    )}
  >
    {label}
  </Link>
);
