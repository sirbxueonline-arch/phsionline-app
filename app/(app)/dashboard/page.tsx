"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Gauge, Sparkles } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-brand via-indigo-600 to-sky-500 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-white/80">Welcome back</p>
            <h1 className="mt-2 text-3xl font-semibold">
              {profile?.name || user?.email?.split("@")[0] || "Pilot"}
            </h1>
            <p className="mt-2 max-w-xl text-white/80">
              Ship new flashcards, quizzes, and plans with AI. Everything you need is one hop away.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/generate">
                <Button className="bg-white text-slate-900 hover:bg-slate-100">
                  Generate material
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/library">
                <Button variant="outline" className="border-white/60 text-white hover:bg-white/10">
                  View library
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm shadow-lg">
            <p className="flex items-center gap-2 text-white/80">
              <Gauge className="h-4 w-4" />
              Monthly usage
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {usage ?? "–"} / 20 <span className="text-sm font-medium text-white/70">saves</span>
            </p>
            <div className="mt-2 h-2 w-48 rounded-full bg-white/20">
              <div
                className="h-2 rounded-full bg-white"
                style={{ width: `${Math.min(100, ((usage ?? 0) / 20) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/70 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              Quick start
            </CardTitle>
            <CardDescription>Jump into your most common flows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/generate">
              <Button className="w-full">Generate new set</Button>
            </Link>
            <Link href="/study">
              <Button variant="outline" className="w-full">
                Start a study session
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent saves</CardTitle>
            <CardDescription>Keep momentum with your latest items.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading && <p className="text-sm text-slate-500">Loading...</p>}
              {!loading && resources.length === 0 && (
                <p className="text-sm text-slate-500">No items yet. Generate your first resource.</p>
              )}
              {resources.map((res) => (
                <Link
                  key={res.id}
                  href={`/library/${res.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200/70 px-3 py-2 text-sm hover:border-brand hover:bg-brand/5 dark:border-slate-800"
                >
                  <div>
                    <p className="font-medium capitalize">{res.title || res.type}</p>
                    <p className="text-xs text-slate-500">
                      {res.type} · {res.subject || "General"} · {formatDate(res.created_at)}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {res.type}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Free tier allows 20 saves/month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-slate-200/70 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500">You&apos;ve saved</p>
              <p className="text-3xl font-semibold">{usage ?? "–"}</p>
              <p className="text-xs text-slate-500">Resets monthly</p>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-brand to-indigo-500"
                style={{ width: `${Math.min(100, ((usage ?? 0) / 20) * 100)}%` }}
              />
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
        <Card>
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
        <Card>
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
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-brand/60 hover:bg-brand/5 dark:border-slate-800"
              >
                <p>{prompt}</p>
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
