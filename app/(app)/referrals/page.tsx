"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function ReferralsPage() {
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ joined: 0, pending: 0 });

  const referralCode = profile?.referralCode || user?.uid?.slice(0, 8) || "code";
  const referralLink = `https://studypilot.app?ref=${referralCode}`;

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "billingAttempts"), where("referrer", "==", user.uid));
        const snap = await getDocs(q);
        setStats({ joined: snap.size, pending: Math.max(0, snap.size - 1) });
      } catch (err) {
        console.error("Failed to fetch referral stats", err);
      }
    };
    fetchStats();
  }, [user]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Referral Program</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Share StudyPilot with friends. Benefits unlock soon.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your link</CardTitle>
          <CardDescription>Copy and share this unique referral link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              readOnly
              value={referralLink}
              className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
            />
            <Button onClick={handleCopy}>{copied ? "Copied!" : "Copy link"}</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Joined" value={stats.joined} />
            <Stat label="Pending" value={stats.pending} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Future perk: earn extra generations when friends sign up.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);
