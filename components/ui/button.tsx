"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-brand focus-visible:ring-offset-background";

const variants: Record<string, string> = {
  default: "bg-brand text-white hover:bg-brand/90",
  outline:
    "border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900",
  ghost: "hover:bg-slate-100 dark:hover:bg-slate-900",
  secondary: "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
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
