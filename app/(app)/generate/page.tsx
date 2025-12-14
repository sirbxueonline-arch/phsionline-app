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
import { Gauge, Info, Loader2, Sparkles, Wand2, BookOpenCheck, ClipboardList, Stars, CheckCircle2, NotebookPen } from "lucide-react";

type Tool = "flashcards" | "quiz";

const defaultPrompt =
  "Provide a short passage or topic (e.g. 'Basics of photosynthesis' or paste your notes) and choose a tool.";

const EXAMPLES = [
  "Basics of photosynthesis",
  "Paste my class notes here",
  "Summarize this chapter into a quiz"
];

function encodePayload(data: unknown) {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return encodeURIComponent(btoa(binary));
}

export default function GeneratePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tool, setTool] = useState<Tool>("flashcards");
  const [subject, setSubject] = useState("");
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(6);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("Analyzing…");
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const controller = useMemo(() => new AbortController(), []);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/usage", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) {
          console.warn("Usage fetch skipped", res.status);
          return;
        }
        const json = await res.json();
        if (typeof json?.usage === "number") {
          setUsage(json.usage);
          if (json.usage >= (json.limit ?? 20)) setLimitReached(true);
        }
      } catch (err) {
        console.warn("Usage fetch failed", err);
      }
    };
    fetchUsage();
  }, [user]);

  useEffect(() => {
    if (!loading) return;
    const stages = ["Analyzing…", "Creating…", "Finalizing…"];
    let idx = 0;
    setLoadingStage(stages[idx]);
    const interval = setInterval(() => {
      idx = (idx + 1) % stages.length;
      setLoadingStage(stages[idx]);
    }, 900);
    return () => clearInterval(interval);
  }, [loading]);

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
      const encoded = encodePayload(payload);
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

  const handleFeedbackSubmit = () => {
    if (!feedback.trim()) return;
    setFeedbackSubmitted(true);
    setTimeout(() => setFeedbackSubmitted(false), 3000);
    setFeedback("");
  };

  const usageLimit = 20;
  const usageValue = usage ?? 0;
  const usagePercent = Math.min(100, Math.round((usageValue / usageLimit) * 100));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/40 dark:text-purple-100">
            <Sparkles className="h-4 w-4" /> AI studio
          </span>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]">
            <Gauge className="h-4 w-4" aria-hidden />
            <div className="flex items-center gap-2">
              <span>Credits: {usageValue} / {usageLimit}</span>
              <div className="h-2 w-20 rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600" style={{ width: `${usagePercent}%` }} />
              </div>
            </div>
          </div>
        </div>
        <Link href="/library">
          <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-[#1F2A44] dark:text-[#E5E7EB] dark:hover:bg-[#0B1022]">
            Library
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-[#E5E7EB]">Generate study-ready content</h1>
        <p className="max-w-3xl text-slate-600 dark:text-[#94A3B8]">
          Follow the steps: pick a format, add your topic, set options, and include any extra context.
        </p>
      </div>

      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022]">
        <CardHeader className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-200">
            <CheckCircle2 className="h-4 w-4" /> Step 1 · Choose format
          </div>
          <CardTitle className="flex items-center gap-2 text-xl text-slate-900 dark:text-[#E5E7EB]">
            <Wand2 className="h-5 w-5 text-purple-600" />
            What do you want to generate?
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-[#94A3B8]">
            Pick a format. You can adjust options and add notes next.
          </CardDescription>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              {
                key: "flashcards",
                title: "Flashcards",
                helper: "Memorize key facts",
                icon: <BookOpenCheck className="h-4 w-4 text-purple-600" />
              },
              {
                key: "quiz",
                title: "Quiz",
                helper: "Test yourself with questions",
                icon: <ClipboardList className="h-4 w-4 text-purple-600" />
              }
            ] as const).map((fmt) => {
              const isActive = tool === fmt.key;
              return (
                <button
                  key={fmt.key}
                  onClick={() => setTool(fmt.key)}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-purple-300 bg-purple-50 shadow-sm dark:border-purple-500/60 dark:bg-purple-900/30"
                      : "border-slate-200 bg-white hover:border-purple-200 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:hover:border-purple-400/50"
                  }`}
                >
                  <div className="mt-1">{fmt.icon}</div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-[#E5E7EB]">{fmt.title}</p>
                    <p className="text-sm text-slate-500 dark:text-[#94A3B8]">{fmt.helper}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-200">
              <Stars className="h-4 w-4" /> Step 2 · Topic
            </div>
            <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-slate-700 dark:text-[#E5E7EB]" htmlFor="subject">
                    Subject or title
                  </Label>
                  <Info className="h-4 w-4 text-slate-400" aria-hidden />
                  <span className="sr-only">This title appears on your saved set</span>
                </div>
                <Input
                  id="subject"
                  placeholder="Photosynthesis basics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB] dark:placeholder:text-[#94A3B8]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-slate-700 dark:text-[#E5E7EB]" htmlFor="topic">
                    Notes or source text (optional)
                  </Label>
                </div>
                <Textarea
                  id="topic"
                  minLength={4}
                  rows={6}
                  placeholder={defaultPrompt}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB] dark:placeholder:text-[#94A3B8]"
                />
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setPrompt(ex)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:border-purple-300 hover:bg-purple-50 dark:border-[#1F2A44] dark:text-[#E5E7EB] dark:hover:border-purple-400/60 dark:hover:bg-purple-900/30"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Tip: bullet points work best.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-200">
              <NotebookPen className="h-4 w-4" /> Step 3 · Options
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022]/60">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                <div className="w-full max-w-[200px] space-y-2">
                  <Label className="text-slate-700 dark:text-[#E5E7EB]" htmlFor="count">
                    Count
                  </Label>
                  <Input
                    id="count"
                    type="number"
                    min={3}
                    max={20}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="border-slate-200 bg-white text-slate-900 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-slate-700 dark:text-[#E5E7EB]">Difficulty</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {[
                      { key: "easy", label: "Easy", sub: "Recall" },
                      { key: "medium", label: "Medium", sub: "Understand & apply" },
                      { key: "hard", label: "Hard", sub: "Exam-style" }
                    ].map((lvl) => {
                      const active = difficulty === lvl.key;
                      return (
                        <button
                          key={lvl.key}
                          type="button"
                          onClick={() => setDifficulty(lvl.key as typeof difficulty)}
                          className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                            active
                              ? "border-purple-400 bg-purple-50 text-purple-900 shadow-sm dark:border-purple-500/60 dark:bg-purple-900/30 dark:text-purple-100"
                              : "border-slate-200 bg-white text-slate-700 hover:border-purple-200 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB] dark:hover:border-purple-400/60"
                          }`}
                        >
                          <p className="font-semibold">{lvl.label}</p>
                          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">{lvl.sub}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-200">
              <Info className="h-4 w-4" /> Step 4 · Extra context (optional)
            </div>
            <p className="text-sm text-slate-600 dark:text-[#94A3B8]">
              Add any clarifications in the notes field above or adjust the title for clearer output.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleGenerate}
              disabled={loading || limitReached}
              className="min-w-[160px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl"
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> {loadingStage}
                </span>
              ) : (
                "Generate"
              )}
            </Button>
            <Button
              onClick={cancelGeneration}
              variant="ghost"
              disabled={!loading}
              className="text-slate-700 hover:underline dark:text-[#E5E7EB]"
            >
              Cancel
            </Button>
            {error && (
              <p className="text-sm text-red-500 dark:text-red-300" role="alert" aria-live="assertive">
                {error}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022]">
        <CardHeader
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setFeedbackOpen((o) => !o)}
        >
          <div>
            <CardTitle className="text-lg text-slate-900 dark:text-[#E5E7EB]">Feedback (optional)</CardTitle>
            <CardDescription className="text-slate-600 dark:text-[#94A3B8]">
              Share ideas after you generate. Collapsed by default.
            </CardDescription>
          </div>
          <span className="text-sm text-purple-600 dark:text-purple-300">{feedbackOpen ? "Hide" : "Show"}</span>
        </CardHeader>
        {feedbackOpen && (
          <CardContent className="space-y-3">
            <Label htmlFor="feedback" className="text-slate-700 dark:text-[#E5E7EB]">
              What should we improve?
            </Label>
            <Textarea
              id="feedback"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us if the output missed context or if you need different formats."
              className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB] dark:placeholder:text-[#94A3B8]"
            />
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleFeedbackSubmit} disabled={!feedback.trim()}>
                Submit feedback
              </Button>
              {feedbackSubmitted && (
                <span className="text-sm text-emerald-600 dark:text-emerald-300" role="status" aria-live="polite">
                  Thanks for the insight!
                </span>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
