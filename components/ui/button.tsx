"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<string, string> = {
  default: "bg-[var(--accent)] text-[var(--text-primary)] hover:bg-[var(--accent-strong)]",
  outline: "border border-[var(--accent)] text-[var(--text-primary)] hover:bg-[var(--surface)]",
  ghost: "text-[var(--text-primary)] hover:bg-[var(--surface)]",
  secondary:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--accent-strong)]"
};

const sizes: Record<string, string> = {
  sm: "h-9 px-3",
  md: "h-10 px-4 py-2",
  lg: "h-12 px-6"
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
