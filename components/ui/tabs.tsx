"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export const Tabs = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className
}: {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  const [internal, setInternal] = React.useState(defaultValue);
  const value = controlledValue ?? internal;
  const setValue = (val: string) => {
    setInternal(val);
    onValueChange?.(val);
  };
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={cn(
      "inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900",
      className
    )}
  >
    {children}
  </div>
);

export const TabsTrigger = ({
  value,
  children,
  className
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs");
  const active = ctx.value === value;
  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-50"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
      )}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({
  value,
  children,
  className
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used within Tabs");
  if (ctx.value !== value) return null;
  return <div className={cn(className)}>{children}</div>;
};
