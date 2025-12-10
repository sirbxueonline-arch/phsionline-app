"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return open
    ? createPortal(
        <div
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => onOpenChange?.(false)}
        >
          <div
            className="w-full max-w-lg"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {children}
          </div>
        </div>,
        document.body
      )
    : null;
};

export const DialogContent = ({
  className,
  children
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900",
      className
    )}
  >
    {children}
  </div>
);

export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4 space-y-2", className)} {...props} />
);

export const DialogTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-xl font-semibold", className)} {...props} />
);

export const DialogDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-slate-600 dark:text-slate-300", className)} {...props} />
);
