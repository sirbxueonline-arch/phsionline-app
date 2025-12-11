"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { CheckCircle2, Copy, Gift, Share2, Sparkles, Users, ArrowUpRight } from "lucide-react";

export default function ReferralsPage() {
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ joined: 0, pending: 0 });

  const referralCode = profile?.referralCode || user?.uid?.slice(0, 8) || "code";
  const referralLink = `https://studycopilot.online/?ref=${referralCode}`;

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
    <div className="min-h-screen bg-slate-100 dark:bg-[#070A14]">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <div className="flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/40 dark:text-purple-100 dark:ring-purple-800/60">
            <Sparkles className="h-4 w-4" /> Invite & earn
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-[#E5E7EB]">Share StudyCopilot</h1>
          <p className="max-w-2xl text-slate-600 dark:text-[#94A3B8]">
            Invite your study crew. Keep your resources synced and unlock perks together.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="border-slate-200 bg-white shadow-lg dark:border-[#1F2A44] dark:bg-[#0B1022]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl text-slate-900 dark:text-[#E5E7EB]">Your referral link</CardTitle>
              <CardDescription className="text-slate-600 dark:text-[#94A3B8]">
                Copy and share this unique link. We’ll track who joins from it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-100/70 p-4 md:flex-row md:items-center dark:border-[#1F2A44] dark:bg-[#0B1022]">
                <input
                  readOnly
                  value={referralLink}
                  className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-400 focus:outline-none dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB] dark:placeholder:text-[#94A3B8]"
                />
                <Button onClick={handleCopy} className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md">
                  {copied ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Copy className="h-4 w-4" /> Copy link
                    </span>
                  )}
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Stat label="Joined" value={stats.joined} accent="bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-100" />
                <Stat label="Pending" value={stats.pending} accent="bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100" />
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-purple-500" />
                  Perks coming soon: extra generations and badges for you and friends who join.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-lg dark:border-[#1F2A44] dark:bg-[#0B1022]">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-[#E5E7EB]">How it works</CardTitle>
              <CardDescription className="text-slate-600 dark:text-[#94A3B8]">
                Simple steps to get your crew on board.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: <Share2 className="h-4 w-4 text-purple-600" />, title: "Share your link", desc: "Send it to friends, classmates, or study groups." },
                { icon: <Users className="h-4 w-4 text-purple-600" />, title: "Friends join", desc: "They sign up through your StudyCopilot link." },
                { icon: <Gift className="h-4 w-4 text-purple-600" />, title: "Earn perks", desc: "Perks roll out soon for you and your referrals." }
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]"
                >
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/40">{item.icon}</div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-[#E5E7EB]">{item.title}</p>
                    <p className="text-slate-600 dark:text-[#94A3B8]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-lg dark:border-[#1F2A44] dark:bg-[#0B1022]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-slate-900 dark:text-[#E5E7EB]">Need assets?</CardTitle>
                <CardDescription className="text-slate-600 dark:text-[#94A3B8]">
                  Grab a short note to send with your link.
                </CardDescription>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]">
                “I’m using StudyCopilot to generate flashcards, quizzes, and study plans. Join me: {referralLink}”
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const Stat = ({ label, value, accent }: { label: string; value: number; accent?: string }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]">
    <p className="text-sm text-slate-500 dark:text-[#94A3B8]">{label}</p>
    <div className="mt-1 inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold">
      <span className={accent || "bg-slate-100 text-slate-800 dark:bg-purple-900/40 dark:text-purple-100"}>{value}</span>
    </div>
  </div>
);
