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
  const background =
    resolvedTheme === "dark" ? "rgba(15, 23, 42, 0.82)" : "rgba(247, 249, 252, 0.92)";

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-50 px-6 py-4 text-sm text-text-muted backdrop-blur-lg"
      style={{
        background,
        boxShadow:
          resolvedTheme === "dark"
            ? "0 -10px 40px rgba(0, 0, 0, 0.35)"
            : "0 -10px 40px rgba(15, 23, 42, 0.08)",
        borderTop: "1px solid transparent",
        backdropFilter: "blur(14px) saturate(140%)"
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
