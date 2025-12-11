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
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-purple-50">
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 text-slate-700">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-semibold">
              {profile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "P"}
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Dashboard</p>
              <h1 className="text-xl font-semibold text-slate-900">
                Welcome, {profile?.name || user?.email?.split("@")[0] || "Pilot"}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <Search className="h-4 w-4" /> Search
            </div>
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
              <Bell className="mr-2 h-4 w-4" /> Alerts
            </Button>
            <Link href="/generate">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Generate
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-purple-50 to-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700 ring-1 ring-purple-100">
                    <Sparkles className="h-4 w-4" /> Continue learning
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">Generate something new today</h2>
                  <p className="max-w-xl text-sm text-slate-600">
                    Flashcards, quizzes, plans, or explanations — keep your streak alive.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/generate">
                      <Button className="bg-purple-600 text-white hover:bg-purple-700">
                        Generate now <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/library">
                      <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
                        View library
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-purple-600">Usage</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{usage ?? "?"} / 20</p>
                  <div className="mt-2 h-2 w-40 rounded-full bg-purple-100">
                    <div className="h-2 rounded-full bg-purple-600" style={{ width: `${usagePct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Resets monthly</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Monthly saves", value: `${usage ?? "?"} / 20`, icon: <Gauge className="h-4 w-4 text-purple-600" />, color: "bg-purple-50 text-purple-700" },
                { label: "Recent items", value: resources.length || 0, icon: <BookOpen className="h-4 w-4 text-emerald-600" />, color: "bg-emerald-50 text-emerald-700" },
                { label: "Generation mix", value: Object.keys(mockChartData).length, icon: <BarChart2 className="h-4 w-4 text-amber-600" />, color: "bg-amber-50 text-amber-700" },
                { label: "Leaderboard", value: "Top 10%", icon: <Trophy className="h-4 w-4 text-indigo-600" />, color: "bg-indigo-50 text-indigo-700" }
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold ${stat.color}`}>
                    {stat.icon}
                    <span>{stat.label}</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">Updated just now</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Quick start
                  </CardTitle>
                  <CardDescription>Jump into your most common flows.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/generate">
                    <Button className="w-full bg-purple-600 text-white shadow">
                      Generate new set
                    </Button>
                  </Link>
                  <Link href="/study">
                    <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50">
                      Start a study session
                    </Button>
                  </Link>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    Save time: pick a preset prompt from the AI suggestions below.
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
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
                        className="flex items-center justify-between rounded-lg border border-slate-200/70 px-3 py-2 text-sm hover:border-orange-200 hover:bg-orange-50"
                      >
                        <div>
                          <p className="font-medium capitalize">{res.title || res.type}</p>
                          <p className="text-xs text-slate-500">
                            {res.type} · {res.subject || "General"} · {formatDate(res.created_at)}
                          </p>
                        </div>
                        <span className="rounded-full bg-orange-50 px-2 py-1 text-xs capitalize text-orange-700 ring-1 ring-orange-200">
                          {res.type}
                        </span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle>Usage</CardTitle>
                  <CardDescription>Free tier allows 20 saves/month.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border border-slate-200/70 bg-slate-50 p-3">
                    <p className="text-sm text-slate-500">You&apos;ve saved</p>
                    <p className="text-3xl font-semibold">{usage ?? "?"}</p>
                    <p className="text-xs text-slate-500">Resets monthly</p>
                  </div>
                  <div className="h-2 rounded-full bg-purple-100">
                    <div className="h-2 rounded-full bg-purple-600" style={{ width: `${usagePct}%` }} />
                  </div>
                  <Link href="/upgrade">
                    <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50">
                      Upgrade to unlock more
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="shadow-sm border-slate-200">
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
                      <Bar dataKey="count" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
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
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-purple-200 hover:bg-purple-50"
                  >
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-600" />
                      {prompt}
                    </p>
                    <Link href="/generate">
                      <Button size="sm" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
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
    </div>
  );
}
