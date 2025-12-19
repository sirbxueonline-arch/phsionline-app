"use client";

import Link from "next/link";

const LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" }
];

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-panel/95 px-6 py-4 text-sm text-text-muted backdrop-blur">
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
