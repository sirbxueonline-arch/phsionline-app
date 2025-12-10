"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        Checking authentication...
      </div>
    );
  }
  return <>{children}</>;
};
