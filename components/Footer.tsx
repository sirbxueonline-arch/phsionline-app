"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PUBLIC_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" }
];

export const Footer = () => {
  const pathname = usePathname();
  const isAppRoute =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/generate") ||
    pathname?.startsWith("/analytics");

  if (isAppRoute) return null;

  return (
    <footer className="mx-auto flex max-w-5xl items-center justify-between px-6 py-10 text-sm text-text-muted">
      <p className="text-text-muted">StudyPilot</p>
      <div className="flex items-center gap-4">
        {PUBLIC_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-text-primary">
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
};
