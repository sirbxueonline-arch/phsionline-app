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
import { formatDate } from "@/lib/utils";
import { BadgeCheck, Gauge, Loader2, Sparkles, Wand2 } from "lucide-react";
import type { FlashcardItem } from "@/components/Flashcard";
import type { QuizItem } from "@/components/QuizQuestion";

type Tool = "flashcards" | "quiz" | "explain" | "plan";

type GenerationResult =
  | { flashcards: FlashcardItem[] }
  | { quiz: QuizItem[] }
  | { explanation: string }
  | { plan: string[] };

const defaultPrompt =
  "Provide a short passage or topic (e.g. 'Basics of photosynthesis' or paste your notes) and choose a tool.";

export default function FullGeneratePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tool, setTool] = useState<Tool>("flashcards");
  const [subject, setSubject] = useState("");
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(6);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [usage, setUsage] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const controller = useMemo(() => new AbortController(), []);

  useEffect(() => {
    const fetchUsage = async () => {
      const client = await getSupabaseClient();
      if (!client || !user) return;
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count: usageCount } = await client
        .from("resources")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.uid)
        .gte("created_at", startOfMonth);
      if (typeof usageCount === "number") {
        setUsage(usageCount);
        if (usageCount >= 20) setLimitReached(true);
      }
    };
    fetchUsage();
  }, [user]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
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
      setResult(data);

      // Immediately route to full result view
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

  const handleSave = async () => {
    if (!result || !user) return;
    setSaving(true);
    const client = await getSupabaseClient();
    if (!client) {
      setSaving(false);
      return;
    }
    const title = subject || `Generated ${tool} - ${formatDate(new Date())}`;
    const { error: insertError } = await client.from("resources").insert({
      user_id: user.uid,
      type: tool,
      title,
      subject,
      content: result
    });
    if (insertError) {
      setError(insertError.message);
    } else {
      setUsage((prev) => (typeof prev === "number" ? prev + 1 : prev));
    }
    setSaving(false);
  };

  const cancelGeneration = () => {
    controller.abort();
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.16),transparent_30%)]" />
      <div className="absolute inset-0 opacity-20 blur-3xl gradient-bg" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-16">
        <div className="flex flex-col gap-3 text-white">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100 ring-1 ring-white/20">
              <Sparkles className="h-4 w-4" /> AI studio
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200 ring-1 ring-white/10">
              <Gauge className="h-4 w-4" /> Usage {usage ?? "?"}/20
            </span>
          </div>
          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
            Build flashcards, quizzes, explanations, and study plans in one flow.
          </h1>
          <p className="max-w-3xl text-slate-200">
            Paste notes or a topic, pick the tool, and we format it for study. Switch tools instantly and keep your
            monthly saves in view.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-slate-800/80 bg-slate-900/70 text-white shadow-2xl">
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Wand2 className="h-5 w-5 text-cyan-300" />
                  Generation prompt
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Describe your topic and pick the output style.
                </CardDescription>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100 ring-1 ring-white/15">
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
                          ? "bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-900 shadow-lg"
                          : "border-slate-700 text-slate-200 hover:border-cyan-400/60 hover:text-white"
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
                  <Label className="text-slate-200">Subject or title</Label>
                  <Input
                    placeholder="Photosynthesis basics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="border-slate-700/80 bg-slate-900 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-slate-200">Count</Label>
                    <Input
                      type="number"
                      min={3}
                      max={20}
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="border-slate-700/80 bg-slate-900 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-200">Difficulty</Label>
                    <Input
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="border-slate-700/80 bg-slate-900 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Topic or paste text</Label>
                <Textarea
                  minLength={4}
                  rows={8}
                  placeholder={defaultPrompt}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="border-slate-700/80 bg-slate-900 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={loading || limitReached}
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-900 shadow-lg"
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
                  className="border-slate-700 text-white hover:border-cyan-400/60"
                >
                  Cancel
                </Button>
                {error && <p className="text-sm text-red-300">{error}</p>}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-slate-800/80 bg-slate-900/70 text-white shadow-xl">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BadgeCheck className="h-4 w-4 text-cyan-300" />
                    Ready to ship
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Track usage and jump into saved sets.
                  </CardDescription>
                </div>
                <Link href="/library">
                  <Button size="sm" variant="outline" className="border-slate-700 text-white hover:border-cyan-400/60">
                    Library
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Monthly saves</p>
                    <p className="text-2xl font-semibold">{usage ?? "?"} / 20</p>
                  </div>
                  <div className="h-2 w-32 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                      style={{ width: `${Math.min(100, ((usage ?? 0) / 20) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="grid gap-2 text-sm text-slate-200">
                  {[
                    "Flashcards: Intro to photosynthesis (6 cards, medium)",
                    "Quiz: World War II timeline (8 questions)",
                    "Study plan: Calculus exam in 2 weeks"
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setPrompt(preset)}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-left hover:border-cyan-400/50 hover:bg-slate-900"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-cyan-300" />
                        {preset}
                      </span>
                      <span className="text-xs text-slate-400">Use</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
