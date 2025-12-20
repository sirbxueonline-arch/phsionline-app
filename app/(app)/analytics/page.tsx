"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

type Resource = { id: string; type: string; createdAt?: string };

const COLORS = ["#7C3AED", "#22C55E", "#0EA5E9", "#F97316"];

export default function AnalyticsPage() {
  const { user } = useAuth();
  // Use mock data for locked analytics
  const weeklyCounts = useMemo(
    () => [
      { week: "2025-W01", count: 4 },
      { week: "2025-W02", count: 7 },
      { week: "2025-W03", count: 5 },
      { week: "2025-W04", count: 9 },
      { week: "2025-W05", count: 6 }
    ],
    []
  );
  const typeCounts = useMemo(
    () => [
      { name: "Flashcards", value: 16 },
      { name: "Quiz", value: 9 },
      { name: "Both", value: 6 },
      { name: "Plan", value: 3 }
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Analytics</h1>
          <p className="text-slate-600 dark:text-slate-300">Visualize your study output.</p>
        </div>
        <Button
          onClick={() => (typeof window !== "undefined" ? (window.location.href = "/pricing") : null)}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
        >
          Upgrade to Pro
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[{ title: "Resources per week", desc: "Generation cadence over time." }, { title: "Content type mix", desc: "Flashcards vs. quizzes vs. explanations." }].map(
          (card, idx) => (
            <Card key={card.title} className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 backdrop-blur-sm bg-white/40 dark:bg-slate-900/40 z-10" />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-white/50 to-white/10 dark:from-slate-900/60 dark:to-slate-900/20">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Upgrade to see live analytics</p>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                  onClick={() => (typeof window !== "undefined" ? (window.location.href = "/pricing") : null)}
                >
                  Upgrade to Pro
                </Button>
              </div>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.desc}</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {idx === 0 ? (
                    <LineChart data={weeklyCounts}>
                      <XAxis dataKey="week" hide />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line dataKey="count" stroke="#7C3AED" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  ) : (
                    <PieChart>
                      <Pie data={typeCounts} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
                        {typeCounts.map((entry, i) => (
                          <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
