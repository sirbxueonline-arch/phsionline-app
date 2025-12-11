"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Gauge, Sparkles, BookOpen, CheckCircle2, BarChart2 } from "lucide-react";

type Resource = {
  id: string;
  title: string;
  type: string;
  subject?: string | null;
  created_at?: string;
};

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<number | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      const client = await getSupabaseClient();
      if (!client || !user) {
        setLoading(false);
        return;
      }
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const [{ data }, { count }] = await Promise.all([
        client
          .from("resources")
          .select("id,title,type,subject,created_at")
          .eq("user_id", user.uid)
          .order("created_at", { ascending: false })
          .limit(5),
        client.from("resources").select("id", { count: "exact", head: true }).eq("user_id", user.uid).gte("created_at", startOfMonth)
      ]);
      if (data) setResources(data as Resource[]);
      if (typeof count === "number") setUsage(count);
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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 text-white shadow-xl ring-1 ring-white/10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Welcome back</p>
            <h1 className="text-3xl font-semibold">
              {profile?.name || user?.email?.split("@")[0] || "Pilot"}
            </h1>
            <p className="max-w-2xl text-slate-200">
              Ship new flashcards, quizzes, and plans with AI. Pick a path below or jump into your library.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/generate">
                <Button className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-900 shadow-lg">
                  Generate material
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/library">
                <Button variant="outline" className="border-slate-700 text-white hover:border-cyan-300/60">
                  View library
                </Button>
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Monthly saves", value: `${usage ?? "?"} / 20`, icon: <Gauge className="h-4 w-4" /> },
                { label: "Recent items", value: resources.length || 0, icon: <BookOpen className="h-4 w-4" /> },
                { label: "Generation mix", value: Object.keys(mockChartData).length, icon: <BarChart2 className="h-4 w-4" /> }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-100">
                    {stat.icon}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/70">{stat.label}</p>
                    <p className="text-lg font-semibold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm shadow-lg">
            <p className="flex items-center gap-2 text-white/80">
              <Gauge className="h-4 w-4" />
              Monthly usage
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {usage ?? "?"} / 20 <span className="text-sm font-medium text-white/70">saves</span>
            </p>
            <div className="mt-2 h-2 w-48 rounded-full bg-white/15">
              <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" style={{ width: `${usagePct}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/70">Resets monthly. Upgrade for more capacity.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/50 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              Quick start
            </CardTitle>
            <CardDescription>Jump into your most common flows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/generate">
              <Button className="w-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-900 shadow">
                Generate new set
              </Button>
            </Link>
            <Link href="/study">
              <Button variant="outline" className="w-full border-slate-300 text-slate-900 hover:border-cyan-400/60 dark:text-white">
                Start a study session
              </Button>
            </Link>
            <div className="rounded-lg border border-slate-200/70 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Save time: pick a preset prompt from the AI suggestions below.
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent saves</CardTitle>
            <CardDescription>Keep momentum with your latest items.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading && <p className="text-sm text-slate-500">Loading...</p>}
              {!loading && resources.length === 0 && <p className="text-sm text-slate-500">No items yet. Generate your first resource.</p>}
              {resources.map((res) => (
                <Link
                  key={res.id}
                  href={`/library/${res.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200/70 px-3 py-2 text-sm hover:border-cyan-300/70 hover:bg-cyan-50/50 dark:border-slate-800 dark:hover:bg-slate-900"
                >
                  <div>
                    <p className="font-medium capitalize">{res.title || res.type}</p>
                    <p className="text-xs text-slate-500">
                      {res.type} · {res.subject || "General"} · {formatDate(res.created_at)}
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-50 px-2 py-1 text-xs capitalize text-slate-700 ring-1 ring-cyan-200 dark:bg-slate-800 dark:text-slate-200">
                    {res.type}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Free tier allows 20 saves/month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-slate-200/70 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500">You&apos;ve saved</p>
              <p className="text-3xl font-semibold">{usage ?? "?"}</p>
              <p className="text-xs text-slate-500">Resets monthly</p>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-2 rounded-full bg-gradient-to-r from-brand to-indigo-500" style={{ width: `${usagePct}%` }} />
            </div>
            <Link href="/upgrade">
              <Button variant="outline" className="w-full">
                Upgrade to unlock more
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Analytics snapshot</CardTitle>
            <CardDescription>Mix of content types generated.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartArray}>
                  <XAxis dataKey="type" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>AI suggestions</CardTitle>
            <CardDescription>Prompts curated for faster starts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              "Flashcards: Intro to photosynthesis (6 cards, medium)",
              "Quiz: World War II timeline (8 questions)",
              "Study plan: Calculus exam in 2 weeks"
            ].map((prompt) => (
              <div
                key={prompt}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-cyan-300/60 hover:bg-cyan-50/70 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                  {prompt}
                </p>
                <Link href="/generate">
                  <Button size="sm" variant="outline">
                    Use
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
