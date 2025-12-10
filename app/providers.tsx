"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/AuthProvider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
};
