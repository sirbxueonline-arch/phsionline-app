"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, query, setDoc, updateDoc, where, increment } from "firebase/firestore";
import { CheckCircle2, Copy, Gift, Share2, Sparkles, Users } from "lucide-react";

export default function ReferralsPage() {
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState<"idle" | "shared" | "copied">("idle");
  const [stats, setStats] = useState({ joined: 0, pending: 0 });

  const referralCode = profile?.referralCode || user?.uid?.slice(0, 8) || "code";
  const referralLink = `https://studypilot.online/?ref=${referralCode}`;
  const shareMessage = `I study with StudyPilot for focused flashcards, quizzes, and plans. Join me: ${referralLink}`;
  const displayName = profile?.name || user?.displayName || user?.email?.split("@")[0] || "StudyPilot";

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
    void trackReferralShare();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "StudyCopilot referral",
          text: shareMessage,
          url: referralLink
        });
        setShared("shared");
      } else {
        await navigator.clipboard.writeText(shareMessage);
        setShared("copied");
      }
      void trackReferralShare();
    } catch (err) {
      await navigator.clipboard.writeText(shareMessage);
      setShared("copied");
      void trackReferralShare();
    } finally {
      setTimeout(() => setShared("idle"), 2500);
    }
  };

  const trackReferralShare = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          name: displayName,
          referralShares: increment(1),
          referralPoints: increment(10),
          lastReferralShareName: displayName,
          lastReferralShareAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to record referral share", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">Referrals</p>
        <h1 className="text-3xl font-semibold text-text-primary">Share StudyPilot</h1>
        <p className="max-w-2xl text-text-muted">
          Invite a few focused classmates. Study together with calm, distraction-free sets.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <Card className="rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur dark:border-[#1F2A44] dark:bg-[#0B1022]">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-text-primary">Your referral link</CardTitle>
            <CardDescription className="text-text-muted">
              Share your personal link with classmates who want a focused study space.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 md:flex-row md:items-center dark:border-[#1F2A44] dark:bg-[#0B1022]">
              <input
                readOnly
                value={referralLink}
                onClick={handleCopy}
                className="flex-1 cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-400 focus:outline-none dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB] dark:placeholder:text-[#94A3B8]"
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
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur dark:border-[#1F2A44] dark:bg-[#0B1022]">
          <CardHeader>
            <CardTitle className="text-lg text-text-primary">How it works</CardTitle>
            <CardDescription className="text-text-muted">Three calm steps to bring friends in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: <Share2 className="h-4 w-4 text-accent" />, title: "Share your link", desc: "Send it to trusted classmates." },
              { icon: <Users className="h-4 w-4 text-accent" />, title: "They join you", desc: "You study in the same exam-focused workspace." },
              { icon: <Sparkles className="h-4 w-4 text-accent" />, title: "Unlock perks", desc: "Perks roll out quietly for both of you." }
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]"
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

        <Card className="rounded-2xl border border-border bg-panel shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg text-text-primary">Closing note</CardTitle>
              <CardDescription className="text-text-muted">
                A calm line to send with your link.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {shared !== "idle" && (
                <span className="text-xs font-medium text-accent">
                  {shared === "shared" ? "Shared" : "Copied"}
                </span>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={handleShare}
                className="rounded-full"
              >
                Copy note
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-text-primary">
            <p>Join me on StudyPilot for focused flashcards, quizzes, and plans—no distractions.</p>
            <p className="text-text-muted">Perks will roll out gradually, kept simple and useful.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const Stat = ({ label, value, accent }: { label: string; value: number; accent?: string }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-slate-900 shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]">
    <p className="text-sm text-slate-500 dark:text-[#94A3B8]">{label}</p>
    <div className="mt-1 inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold">
      <span className={accent || "bg-slate-100 text-slate-800 dark:bg-purple-900/40 dark:text-purple-100"}>{value}</span>
    </div>
  </div>
);
