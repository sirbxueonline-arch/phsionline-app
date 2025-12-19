"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { collection, getDocs, orderBy, query as fsQuery, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Resource = {
  id: string;
  title: string;
  type: string;
  subject?: string | null;
  createdAt?: string;
};

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<number | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      if (!user) {
        setLoading(false);
        return;
      }
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const q = fsQuery(collection(db, "resources"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setResources(items.filter((r) => r.type !== "usage-log").slice(0, 5) as Resource[]);
      setUsage(items.filter((r) => r.type === "usage-log" && r.createdAt >= startOfMonth).length);
      setLoading(false);
    };
    fetchResources();
  }, [user]);

  const mockChartData =
    resources.length > 0
      ? resources.reduce<Record<string, number>>((acc, r) => {
          const key = r.type;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {})
      : { flashcards: 6, quiz: 4, plan: 2, explain: 3 };

  const chartArray = Object.entries(mockChartData).map(([type, count]) => ({ type, count }));
  const usagePct = Math.min(100, ((usage ?? 0) / 20) * 100);
  const suggestions = [
    "Flashcards: Intro to photosynthesis (6 cards, medium)",
    "Quiz: World War II timeline (8 questions)",
    "Study plan: Calculus exam in 2 weeks"
  ];
  const leaderboard = [
    { label: "Focus streak", value: "3 sessions this week" },
    { label: "Recent activity", value: `${resources.length || 0} items saved` },
    { label: "Confidence", value: "Improving pace + accuracy" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-panel/70 p-5 shadow-sm">
        <div className="flex items-center gap-3 text-text-primary">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-lg font-semibold text-accent ring-1 ring-border">
            {profile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "P"}
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Dashboard</p>
            <h1 className="text-2xl font-semibold">
              Welcome, {profile?.name || user?.email?.split("@")[0] || "Pilot"}
            </h1>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="rounded-3xl border border-border bg-panel p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                <Sparkles className="h-4 w-4 text-accent" /> Generate
              </div>
              <h2 className="text-2xl font-semibold text-text-primary">Generate something new today</h2>
              <p className="max-w-xl text-sm text-text-muted">
                One focused action to create your next study set. Flashcards, quizzes, or both—ready for exam day.
              </p>
            </div>
            <Link href="/generate">
              <Button className="bg-accent text-[var(--text-on-accent)] shadow-sm hover:bg-accent-strong">
                Generate
              </Button>
            </Link>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="flex flex-col border border-border bg-panel shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Recommended for you
              </CardTitle>
              <CardDescription className="text-text-muted">Use a suggestion to start instantly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestions.map((prompt, idx) => (
                <div
                  key={prompt}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition",
                    idx === 0
                      ? "border-accent/30 bg-surface"
                      : "border-border bg-panel hover:border-accent/40"
                  )}
                >
                  <p className="flex items-center gap-2 text-text-primary">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    {prompt}
                  </p>
                  <Link href="/generate">
                    <Button
                      size="sm"
                      className="bg-accent text-[var(--text-on-accent)] shadow-sm hover:bg-accent-strong"
                    >
                      Use suggestion
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="flex flex-col border border-border bg-panel shadow-sm">
            <CardHeader>
              <CardTitle>Recent saves</CardTitle>
              <CardDescription className="text-text-muted">Keep momentum with your latest items.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3 !space-y-0">
              <div className="flex-1 space-y-3">
                {loading && <p className="text-sm text-text-muted">Loading...</p>}
                {!loading && resources.length === 0 && (
                  <p className="text-sm text-text-muted">No items yet. Generate your first resource.</p>
                )}
                {resources.map((res) => (
                  <Link
                    key={res.id}
                    href={`/library/${res.id}`}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm transition hover:border-accent/40 hover:bg-surface"
                  >
                    <div>
                      <p className="font-medium capitalize text-text-primary">{res.title || res.type}</p>
                      <p className="text-xs text-text-muted">
                  {res.type} - {res.subject || "General"} - {formatDate(res.createdAt)}
                </p>
                    </div>
                    <span className="rounded-full bg-surface px-2 py-1 text-xs capitalize text-text-muted ring-1 ring-border">
                      {res.type}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle>Analytics snapshot</CardTitle>
              <CardDescription className="text-text-muted">
                Overview only — not a performance score.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartArray}>
                    <XAxis dataKey="type" stroke="var(--text-muted)" />
                    <YAxis allowDecimals={false} stroke="var(--text-muted)" />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--border)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle>Usage</CardTitle>
              <CardDescription className="text-text-muted">
                Free plan includes 20 saves per month.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-sm text-text-muted">You&apos;ve saved</p>
                <p className="text-3xl font-semibold text-text-primary">{usage ?? "?"}</p>
                <p className="text-xs text-text-muted">Resets monthly</p>
              </div>
              <div className="h-2 rounded-full bg-accent/10">
                <div className="h-2 rounded-full bg-accent" style={{ width: `${usagePct}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription className="text-text-muted">Calm, personal progress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-text-muted">
              {leaderboard.map((item) => (
                <div key={item.label} className="rounded-lg border border-border bg-surface px-3 py-2">
                  <p className="text-xs uppercase tracking-[0.12em] text-text-muted">{item.label}</p>
                  <p className="text-text-primary">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
