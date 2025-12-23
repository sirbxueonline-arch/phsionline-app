"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const onVerifyPage = pathname?.startsWith("/verify-email");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/signin");
      return;
    }
    if (!user.emailVerified && !onVerifyPage) {
      router.replace("/verify-email");
    }
  }, [loading, user, router, onVerifyPage]);

  if (loading || !user || (!user.emailVerified && !onVerifyPage)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        Checking authentication...
      </div>
    );
  }
  return <>{children}</>;
};
