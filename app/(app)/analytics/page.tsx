"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

type Resource = { id: string; type: string; created_at?: string };

const COLORS = ["#7C3AED", "#22C55E", "#0EA5E9", "#F97316"];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      const client = await getSupabaseClient();
      if (!client || !user) return;
      const { data } = await client
        .from("resources")
        .select("id,type,created_at")
        .eq("user_id", user.uid)
        .neq("type", "usage-log")
        .order("created_at", { ascending: true });
      if (data) setResources(data as Resource[]);
    };
    fetchResources();
  }, [user]);

  const typeCounts = useMemo(() => {
    const tally: Record<string, number> = {};
    resources.forEach((r) => {
      tally[r.type] = (tally[r.type] || 0) + 1;
    });
    return Object.entries(tally).map(([type, value]) => ({ name: type, value }));
  }, [resources]);

  const weeklyCounts = useMemo(() => {
    const weeks: Record<string, number> = {};
    resources.forEach((r) => {
      const date = r.created_at ? new Date(r.created_at) : new Date();
      const label = `${date.getFullYear()}-W${getWeekNumber(date)}`;
      weeks[label] = (weeks[label] || 0) + 1;
    });
    return Object.entries(weeks).map(([week, count]) => ({ week, count }));
  }, [resources]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <p className="text-slate-600 dark:text-slate-300">Visualize your study output.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resources per week</CardTitle>
            <CardDescription>Generation cadence over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyCounts}>
                <XAxis dataKey="week" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line dataKey="count" stroke="#7C3AED" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Content type mix</CardTitle>
            <CardDescription>Flashcards vs. quizzes vs. explanations.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeCounts} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
                  {typeCounts.map((entry, idx) => (
                    <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getWeekNumber(date: Date) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDays = Math.floor((Number(date) - Number(firstDay)) / 86400000);
  return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
}
