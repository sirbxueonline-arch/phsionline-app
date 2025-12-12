"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Gauge, Sparkles, BookOpen, CheckCircle2, BarChart2, Search, Plus, Trophy, Bell } from "lucide-react";

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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-[#1F2A44] dark:bg-[#0B1022]">
        <div className="flex items-center gap-3 text-slate-700 dark:text-[#E5E7EB]">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-purple-100 text-lg font-semibold text-purple-700 dark:bg-purple-900/50 dark:text-purple-200">
            {profile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "P"}
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-[#94A3B8]">Dashboard</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-[#E5E7EB]">
              Welcome, {profile?.name || user?.email?.split("@")[0] || "Pilot"}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]">
            <Search className="h-4 w-4" /> Search
          </div>
          <Button
            variant="outline"
            className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-[#1F2A44] dark:text-[#E5E7EB] dark:hover:bg-[#0B1022]"
          >
            <Bell className="mr-2 h-4 w-4" /> Alerts
          </Button>
          <Link href="/generate">
            <Button className="rounded-full bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Generate
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-white via-indigo-50/60 to-white p-6 shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700 ring-1 ring-purple-100 dark:bg-transparent dark:text-purple-200 dark:ring-purple-900/60">
                  <Sparkles className="h-4 w-4" /> Continue learning
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-[#E5E7EB]">Generate something new today</h2>
                <p className="max-w-xl text-sm text-slate-600 dark:text-[#94A3B8]">
                  Flashcards, quizzes, plans, or explanations - keep your streak alive.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/generate">
                    <Button className="rounded-full bg-purple-600 text-white shadow hover:bg-purple-700">
                      Generate now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/library">
                    <Button
                      variant="outline"
                      className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-[#1F2A44] dark:text-[#E5E7EB] dark:hover:bg-[#0B1022]"
                    >
                      View library
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 text-sm text-slate-700 shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]">
                <p className="text-xs uppercase tracking-wide text-purple-600 dark:text-purple-300">Usage</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-[#E5E7EB]">{usage ?? "?"} / 20</p>
                <div className="mt-3 h-2 w-44 rounded-full bg-purple-100 dark:bg-purple-900/40">
                  <div className="h-2 rounded-full bg-purple-600" style={{ width: `${usagePct}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-[#94A3B8]">Resets monthly</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Monthly saves", value: `${usage ?? "?"} / 20`, icon: <Gauge className="h-4 w-4 text-purple-600" />, color: "bg-purple-50 text-purple-700" },
              { label: "Recent items", value: resources.length || 0, icon: <BookOpen className="h-4 w-4 text-emerald-600" />, color: "bg-emerald-50 text-emerald-700" },
              { label: "Generation mix", value: Object.keys(mockChartData).length, icon: <BarChart2 className="h-4 w-4 text-amber-600" />, color: "bg-amber-50 text-amber-700" },
              { label: "Leaderboard", value: "Top 10%", icon: <Trophy className="h-4 w-4 text-indigo-600" />, color: "bg-indigo-50 text-indigo-700" }
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022]"
              >
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold ${stat.color} dark:bg-purple-900/40 dark:text-purple-100`}
                >
                  {stat.icon}
                  <span>{stat.label}</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-[#E5E7EB]">{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Updated just now</p>
              </div>
            ))}
          </div>

          <div className="grid auto-rows-[1fr] gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card className="flex min-h-[240px] flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Quick start
                </CardTitle>
                <CardDescription>Jump into your most common flows.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3 !space-y-0">
                <Link href="/generate">
                  <Button className="w-full rounded-full bg-purple-600 text-white shadow hover:bg-purple-700">
                    Generate new set
                  </Button>
                </Link>
                <Link href="/study">
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-[#1F2A44] dark:text-[#E5E7EB] dark:hover:bg-[#0B1022]"
                  >
                    Start a study session
                  </Button>
                </Link>
                <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]">
                  Save time: pick a preset prompt from the AI suggestions below.
                </div>
              </CardContent>
            </Card>

            <Card className="flex min-h-[240px] flex-col">
              <CardHeader>
                <CardTitle className="dark:text-[#E5E7EB]">Recent saves</CardTitle>
                <CardDescription className="dark:text-[#94A3B8]">Keep momentum with your latest items.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3 !space-y-0">
                <div className="flex-1 space-y-3">
                  {loading && <p className="text-sm text-slate-500 dark:text-[#94A3B8]">Loading...</p>}
                  {!loading && resources.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-[#94A3B8]">No items yet. Generate your first resource.</p>
                  )}
                  {resources.map((res) => (
                    <Link
                      key={res.id}
                      href={`/library/${res.id}`}
                      className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm shadow-sm transition hover:border-purple-200 hover:bg-purple-50 dark:border-[#1F2A44] dark:hover:bg-[#0B1022]"
                    >
                      <div>
                        <p className="font-medium capitalize dark:text-[#E5E7EB]">{res.title || res.type}</p>
                        <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                          {res.type} - {res.subject || "General"} - {formatDate(res.created_at)}
                        </p>
                      </div>
                      <span className="rounded-full bg-purple-50 px-2 py-1 text-xs capitalize text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/40 dark:text-purple-100 dark:ring-purple-800">
                        {res.type}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="flex min-h-[240px] flex-col">
              <CardHeader>
                <CardTitle className="dark:text-[#E5E7EB]">Usage</CardTitle>
                <CardDescription className="dark:text-[#94A3B8]">Free tier allows 20 saves/month.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3 !space-y-0">
                <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3 dark:border-[#1F2A44] dark:bg-[#0B1022]">
                  <p className="text-sm text-slate-500 dark:text-[#94A3B8]">You&apos;ve saved</p>
                  <p className="text-3xl font-semibold dark:text-[#E5E7EB]">{usage ?? "?"}</p>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Resets monthly</p>
                </div>
                <div className="h-2 rounded-full bg-purple-100 dark:bg-purple-900/40">
                  <div className="h-2 rounded-full bg-purple-600 dark:bg-purple-500" style={{ width: `${usagePct}%` }} />
                </div>
                <Link href="/upgrade">
                  <Button
                    variant="outline"
                    className="mt-auto w-full rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-[#1F2A44] dark:text-[#E5E7EB] dark:hover:bg-[#0B1022]"
                  >
                    Upgrade to unlock more
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022]">
            <CardHeader>
              <CardTitle className="dark:text-[#E5E7EB]">Analytics snapshot</CardTitle>
              <CardDescription className="dark:text-[#94A3B8]">Mix of content types generated.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartArray}>
                    <XAxis dataKey="type" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022]">
            <CardHeader>
              <CardTitle className="dark:text-[#E5E7EB]">AI suggestions</CardTitle>
              <CardDescription className="dark:text-[#94A3B8]">Prompts curated for faster starts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Flashcards: Intro to photosynthesis (6 cards, medium)",
                "Quiz: World War II timeline (8 questions)",
                "Study plan: Calculus exam in 2 weeks"
              ].map((prompt) => (
                <div
                  key={prompt}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm transition hover:border-purple-200 hover:bg-purple-50 dark:border-[#1F2A44] dark:hover:bg-[#0B1022]"
                >
                  <p className="flex items-center gap-2 dark:text-[#E5E7EB]">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    {prompt}
                  </p>
                  <Link href="/generate">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-[#1F2A44] dark:text-[#E5E7EB] dark:hover:bg-[#0B1022]"
                    >
                      Use
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
