"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase";
import { BadgeCheck, Gauge, Loader2, Sparkles, Wand2 } from "lucide-react";

type Tool = "flashcards" | "quiz" | "explain" | "plan";

const defaultPrompt =
  "Provide a short passage or topic (e.g. 'Basics of photosynthesis' or paste your notes) and choose a tool.";

export default function GeneratePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tool, setTool] = useState<Tool>("flashcards");
  const [subject, setSubject] = useState("");
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(6);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const controller = useMemo(() => new AbortController(), []);

  useEffect(() => {
    const fetchUsage = async () => {
      const client = await getSupabaseClient();
      if (!client || !user) return;
      try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const { count: usageCount, error: usageError } = await client
          .from("resources")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.uid)
          .gte("created_at", startOfMonth);

        if (usageError) {
          console.warn("Usage fetch skipped (Supabase auth)", usageError?.message);
          return;
        }

        if (typeof usageCount === "number") {
          setUsage(usageCount);
          if (usageCount >= 20) setLimitReached(true);
        }
      } catch (err) {
        console.warn("Usage fetch failed", err);
      }
    };
    fetchUsage();
  }, [user]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: user ? `Bearer ${await user.getIdToken()}` : ""
        },
        signal: controller.signal,
        body: JSON.stringify({
          tool,
          text: prompt || defaultPrompt,
          settings: { count, difficulty, subject }
        })
      });
      if (res.status === 429 || res.status === 403) {
        setLimitReached(true);
        setError("Monthly free limit reached. Upgrade to continue.");
        return;
      }
      const responseJson = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          responseJson?.error ||
          responseJson?.detail ||
          (typeof responseJson === "string" ? responseJson : null) ||
          `Generation failed (${res.status})`;
        throw new Error(message);
      }
      const data = responseJson || {};

      const payload = {
        ...data,
        type: tool,
        title: subject || `Generated ${tool}`,
        subject
      };
      const encoded = encodeURIComponent(btoa(JSON.stringify(payload)));
      router.push(`/generate/view?data=${encoded}`);
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Generation cancelled");
      } else {
        setError(err.message || "Generation failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelGeneration = () => {
    controller.abort();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/40 dark:text-purple-100">
            <Sparkles className="h-4 w-4" /> AI studio
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-[#0B1022] dark:text-[#E5E7EB]">
            <Gauge className="h-4 w-4" /> Usage {usage ?? "?"}/20
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-[#E5E7EB]">Generate study-ready content</h1>
        <p className="max-w-3xl text-slate-600 dark:text-[#94A3B8]">
          Paste notes or a topic, pick the tool, and we format it for study. Switch tools instantly and keep your monthly saves in view.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-[#1F2A44] dark:bg-[#0B1022]">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900 dark:text-[#E5E7EB]">
                <Wand2 className="h-5 w-5 text-purple-600" />
                Generation prompt
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-[#94A3B8]">
                Describe your topic and pick the output style.
              </CardDescription>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-[#0B1022] dark:text-[#E5E7EB]">
              {limitReached ? "Limit reached" : "Credits OK"}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {(["flashcards", "quiz", "explain", "plan"] as Tool[]).map((t) => {
                const isActive = tool === t;
                return (
                  <Button
                    key={t}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-[#1F2A44] dark:text-[#E5E7EB] dark:hover:bg-[#0B1022]"
                    }
                    onClick={() => setTool(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Button>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-[#E5E7EB]">Subject or title</Label>
                <Input
                  placeholder="Photosynthesis basics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB] dark:placeholder:text-[#94A3B8]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-[#E5E7EB]">Count</Label>
                  <Input
                    type="number"
                    min={3}
                    max={20}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="border-slate-200 bg-white text-slate-900 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-[#E5E7EB]">Difficulty</Label>
                  <Input
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="border-slate-200 bg-white text-slate-900 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-[#E5E7EB]">Topic or paste text</Label>
              <Textarea
                minLength={4}
                rows={8}
                placeholder={defaultPrompt}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB] dark:placeholder:text-[#94A3B8]"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleGenerate}
                disabled={loading || limitReached}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow hover:shadow-md"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                  </span>
                ) : (
                  "Generate"
                )}
              </Button>
              <Button
                onClick={cancelGeneration}
                variant="outline"
                disabled={!loading}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-[#1F2A44] dark:text-[#E5E7EB] dark:hover:bg-[#0B1022]"
              >
                Cancel
              </Button>
              {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-[#1F2A44] dark:bg-[#0B1022]">
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-[#E5E7EB]">
                  <BadgeCheck className="h-4 w-4 text-purple-600" />
                  Ready to ship
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-[#94A3B8]">
                  Track usage and jump into saved sets.
                </CardDescription>
              </div>
              <Link href="/library">
                <Button size="sm" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-[#1F2A44] dark:text-[#E5E7EB] dark:hover:bg-[#0B1022]">
                  Library
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-[#1F2A44] dark:bg-[#0B1022]">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-[#94A3B8]">Monthly saves</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-[#E5E7EB]">{usage ?? "?"} / 20</p>
                </div>
                <div className="h-2 w-32 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600"
                    style={{ width: `${Math.min(100, ((usage ?? 0) / 20) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="grid gap-2 text-sm text-slate-700 dark:text-[#E5E7EB]">
                {[
                  "Flashcards: Intro to photosynthesis (6 cards, medium)",
                  "Quiz: World War II timeline (8 questions)",
                  "Study plan: Calculus exam in 2 weeks"
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setPrompt(preset)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-left hover:border-purple-200 hover:bg-purple-50 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:hover:bg-[#0B1022]"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      {preset}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Use</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
