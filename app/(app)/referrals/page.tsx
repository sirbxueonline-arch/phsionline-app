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
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
                  <Sparkles className="h-4 w-4" /> Referral dashboard
                </div>
                <h1 className="text-2xl font-semibold text-slate-900">Share StudyCopilot</h1>
                <p className="text-sm text-slate-600">
                  Invite your study crew. Keep your resources synced and unlock perks together.
                </p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Total joined
                </div>
                <p className="mt-1 text-2xl font-semibold">{stats.joined}</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center">
                <input
                  readOnly
                  value={referralLink}
                  className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
                />
                <Button onClick={handleCopy} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md">
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
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Joined" value={stats.joined} accent="bg-blue-50 text-blue-700" />
                <Stat label="Pending" value={stats.pending} accent="bg-amber-50 text-amber-700" />
                <Stat label="Link clicks" value={Math.max(stats.joined * 3, stats.pending)} accent="bg-emerald-50 text-emerald-700" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-slate-200 bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">How it works</CardTitle>
                <CardDescription className="text-slate-600">
                  Three quick steps to get your crew on board.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: <Share2 className="h-4 w-4 text-blue-600" />, title: "Share your link", desc: "Send it to friends, classmates, or study groups." },
                  { icon: <Users className="h-4 w-4 text-blue-600" />, title: "Friends join", desc: "They sign up through your StudyCopilot link." },
                  { icon: <Gift className="h-4 w-4 text-blue-600" />, title: "Earn perks", desc: "Perks roll out soon for you and your referrals." }
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">{item.icon}</div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-900">Need assets?</CardTitle>
                  <CardDescription className="text-slate-600">
                    Grab a short note to send with your link.
                  </CardDescription>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  “I’m using StudyCopilot to generate flashcards, quizzes, and study plans. Join me: {referralLink}”
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

const Stat = ({ label, value, accent }: { label: string; value: number; accent?: string }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm">
    <p className="text-sm text-slate-500">{label}</p>
    <div className="mt-1 inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold">
      <span className={accent || "bg-slate-100 text-slate-800"}>{value}</span>
    </div>
  </div>
);
