"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { Gauge, Sparkles, SlidersHorizontal } from "lucide-react";

type Tool = "flashcards" | "quiz" | "both";

const defaultPrompt =
  "Provide a short passage or topic (e.g. 'Basics of photosynthesis' or paste your notes) and choose a tool.";

const EXAMPLES = ["Photosynthesis basics", "Paste my class notes", "Turn this chapter into a quiz"];

const GENERATE_STAGES = ["Breaking down concepts...", "Drafting study items...", "Checking clarity..."];

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
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questionMix, setQuestionMix] = useState<"mixed" | "concept" | "recall">("mixed");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(GENERATE_STAGES[0]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<number | null>(null);
  const [usageLimit, setUsageLimit] = useState<number | null>(20);
  const [unlimited, setUnlimited] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [showTitleInput, setShowTitleInput] = useState(false);

  const controllerRef = useRef<AbortController | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
          const limitValue = typeof json?.limit === "number" ? json.limit : null;
          setUsageLimit(limitValue);
          const isUnlimited = json?.status === "unlimited" || limitValue === null;
          setUnlimited(isUnlimited);
          if (!isUnlimited && json.usage >= (limitValue ?? 20)) setLimitReached(true);
          if (isUnlimited) setLimitReached(false);
        }
      } catch (err) {
        console.warn("Usage fetch failed", err);
      }
    };
    fetchUsage();
  }, [user]);

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      setLoadingStage(GENERATE_STAGES[0]);
      return;
    }
    setProgress(5);
    setLoadingStage(GENERATE_STAGES[0]);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + 2.5);
        if (next >= 70) {
          setLoadingStage(GENERATE_STAGES[2]);
        } else if (next >= 35) {
          setLoadingStage(GENERATE_STAGES[1]);
        }
        return next;
      });
    }, 220);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    return () => {
      redirectTimeoutRef.current && clearTimeout(redirectTimeoutRef.current);
      progressIntervalRef.current && clearTimeout(progressIntervalRef.current);
      controllerRef.current?.abort();
    };
  }, []);

  const handleGenerate = async () => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    setLoading(true);
    setError(null);
    const safeCount = Number.isFinite(count) && count > 0 ? count : 10;
    const controller = new AbortController();
    controllerRef.current = controller;
    let success = false;
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
          settings: { count: safeCount, difficulty, subject, questionMix }
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
      success = true;
      setProgress((prev) => (prev < 85 ? 85 : prev));
      progressIntervalRef.current && clearTimeout(progressIntervalRef.current);
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = Math.min(100, prev + 5);
          if (next >= 100 && progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          return next;
        });
      }, 100);
      setLoadingStage(GENERATE_STAGES[2]);

      const payload = {
        ...data,
        type: tool,
        title: subject || `Study set - ${tool}`,
        subject
      };
      const encoded = encodePayload(payload);
      redirectTimeoutRef.current = setTimeout(() => {
        router.push(`/generate/view?data=${encoded}`);
        setLoading(false);
        progressIntervalRef.current && clearTimeout(progressIntervalRef.current);
      }, 2000);
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Creation cancelled");
      } else {
        setError(err.message || "Creation failed");
      }
    } finally {
      if (!success) {
        setLoading(false);
        setProgress(0);
        progressIntervalRef.current && clearTimeout(progressIntervalRef.current);
      }
    }
  };

  const cancelGeneration = () => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    progressIntervalRef.current && clearTimeout(progressIntervalRef.current);
    controllerRef.current?.abort();
    setLoading(false);
    setProgress(0);
  };

  const hasPrompt = prompt.trim().length > 0;
  const usageValue = usage ?? 0;
  const effectiveLimit = unlimited ? null : usageLimit ?? 20;
  const usagePercent = effectiveLimit ? Math.min(100, Math.round((usageValue / effectiveLimit) * 100)) : 100;
  const questionMixLabel = {
    mixed: "Mixed question types",
    concept: "Concept questions",
    recall: "Direct recall"
  }[questionMix];
  const difficultyLabel = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard"
  }[difficulty];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 rounded-full border border-slate-200/70 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]">
          <Gauge className="h-4 w-4" aria-hidden />
          <div className="flex items-center gap-2">
            <span>
              Credits: {usageValue} / {unlimited ? "unlimited" : effectiveLimit}
            </span>
            <div className="h-2 w-20 rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-2 rounded-full bg-accent" style={{ width: `${usagePercent}%` }} />
            </div>
          </div>
        </div>
        <Link href="/library">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-[#1F2A44] dark:text-[#E5E7EB] dark:hover:bg-[#0B1022]"
          >
            Library
          </Button>
        </Link>
      </header>

      <Card className="rounded-3xl border border-slate-200/80 bg-white/80 shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022]">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Create</p>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <h1 className="text-3xl font-semibold text-text-primary">Create a study set</h1>
            </div>
          </div>

          <section className="space-y-3">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Paste a topic or your notes here…"
              className="min-h-[220px] w-full resize-none rounded-2xl border border-slate-200/70 bg-white/80 text-base text-slate-900 placeholder:text-slate-500 focus:border-accent focus:ring-accent/30 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB] dark:placeholder:text-[#94A3B8]"
            />
            <div className="flex flex-wrap items-center gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    if (prompt.trim().length === 0) {
                      setPrompt(example);
                    } else {
                      textareaRef.current?.focus();
                    }
                  }}
                  className="rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-sm text-text-muted transition hover:border-accent/50 hover:text-text-primary dark:border-[#1F2A44] dark:bg-[#0B1022]"
                >
                  {example}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2 text-sm">
                {!showTitleInput && !subject && (
                  <button
                    type="button"
                    onClick={() => setShowTitleInput(true)}
                    className="text-text-muted underline-offset-4 hover:text-text-primary hover:underline"
                  >
                    Add title (optional)
                  </button>
                )}
              </div>
            </div>
            {(showTitleInput || subject) && (
              <div className="flex flex-col gap-1 sm:max-w-sm">
                <Label htmlFor="subject" className="text-xs font-semibold text-text-muted">
                  Title (optional)
                </Label>
                <Input
                  id="subject"
                  placeholder="Photosynthesis basics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="border-slate-200/70 bg-white/80 text-sm placeholder:text-slate-500 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]"
                />
              </div>
            )}
          </section>

          <section
            className={`space-y-3 transition-all duration-300 ${
              hasPrompt ? "opacity-100 translate-y-0" : "pointer-events-none -translate-y-1 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-text-primary">Study mode</p>
              <span className="text-xs text-text-muted">Choose how you want to learn</span>
            </div>
            <div className="inline-flex rounded-full border border-slate-200/80 bg-white/80 p-1 text-sm shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022]">
              {[
                { key: "flashcards", label: "Flashcards" },
                { key: "quiz", label: "Quiz" },
                { key: "both", label: "Both" }
              ].map((opt) => {
                const active = tool === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setTool(opt.key as Tool)}
                    className={`rounded-full px-4 py-2 transition ${
                      active
                        ? "bg-accent text-[var(--text-on-accent)] shadow-sm"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section
            className={`space-y-3 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm transition-all duration-300 dark:border-[#1F2A44] dark:bg-[#0B1022] ${
              hasPrompt ? "opacity-100 translate-y-0" : "pointer-events-none -translate-y-1 opacity-0"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-muted">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-text-primary">{count || 10} items</span>
                <span aria-hidden>·</span>
                <span className="font-semibold text-text-primary">{difficultyLabel}</span>
                <span aria-hidden>·</span>
                <span className="font-semibold text-text-primary">{questionMixLabel}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 px-3 py-1 text-xs font-semibold text-text-primary transition hover:border-accent/50 dark:border-[#1F2A44]"
              >
                <SlidersHorizontal className="h-4 w-4" /> {showAdvanced ? "Hide advanced" : "Advanced"}
              </button>
            </div>

            {showAdvanced && (
              <div className="grid gap-4 rounded-xl border border-slate-200/80 bg-white/80 p-4 dark:border-[#1F2A44] dark:bg-[#0B1022]">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-text-muted">Difficulty</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "easy", label: "Easy" },
                        { key: "medium", label: "Medium" },
                        { key: "hard", label: "Hard" }
                      ].map((lvl) => {
                        const active = difficulty === lvl.key;
                        return (
                          <button
                            key={lvl.key}
                            type="button"
                            onClick={() => setDifficulty(lvl.key as typeof difficulty)}
                            className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                              active
                                ? "border-accent/50 bg-surface text-text-primary"
                                : "border-slate-200 bg-white text-slate-700 hover:border-accent/40 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB] dark:hover:border-purple-400/60"
                            }`}
                          >
                            {lvl.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-text-muted" htmlFor="count">
                      Items to create
                    </Label>
                    <Input
                      id="count"
                      type="number"
                      min={3}
                      max={25}
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="border-slate-200 bg-white text-slate-900 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-text-muted">Question mix</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "mixed", label: "Mixed" },
                        { key: "concept", label: "Concept" },
                        { key: "recall", label: "Recall" }
                      ].map((opt) => {
                        const active = questionMix === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setQuestionMix(opt.key as typeof questionMix)}
                            className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                              active
                                ? "border-accent/50 bg-surface text-text-primary"
                                : "border-slate-200 bg-white text-slate-700 hover:border-accent/40 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB] dark:hover:border-purple-400/60"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div
                className="space-y-2 rounded-xl border border-slate-200/80 bg-white/80 p-4 text-sm shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022]"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-text-primary">{loadingStage}</p>
                  <span className="text-xs text-text-muted">Opening your study view next</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleGenerate}
                disabled={loading || !hasPrompt || (limitReached && !unlimited)}
                className="min-w-[180px] bg-accent text-[var(--text-on-accent)] shadow-sm hover:bg-accent-strong"
                aria-busy={loading}
              >
                {loading ? loadingStage : "Generate study set"}
              </Button>
              <Button
                onClick={cancelGeneration}
                variant="ghost"
                disabled={!loading}
                className="text-text-muted hover:text-text-primary"
              >
                Cancel
              </Button>
              {error && (
                <p className="text-sm text-red-500 dark:text-red-300" role="alert" aria-live="assertive">
                  {error}
                </p>
              )}
              {limitReached && !error && !unlimited && (
                <p className="text-sm text-amber-600 dark:text-amber-300">Limit reached. Upgrade to keep creating.</p>
              )}
              {!loading && !error && <p className="text-sm text-text-muted">You can edit everything later.</p>}
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
