"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

const LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" }
];

export const Footer = () => {
  const { resolvedTheme } = useTheme();
  return (
    <footer
      className="px-6 py-4 text-sm text-text-muted"
      style={{
        backgroundColor: "transparent",
        boxShadow: "none",
        borderTop: "1px solid transparent",
        backdropFilter: "none"
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <span className="font-semibold text-text-primary">StudyPilot</span>
        <div className="flex items-center gap-4">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-text-primary">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};
