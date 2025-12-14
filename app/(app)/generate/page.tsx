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
import { Gauge, Info, Loader2, Sparkles, Wand2 } from "lucide-react";

type Tool = "flashcards" | "quiz";

const defaultPrompt =
  "Provide a short passage or topic (e.g. 'Basics of photosynthesis' or paste your notes) and choose a tool.";

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
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [feedback, setFeedback] = useState("");
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

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/40 dark:text-purple-100">
            <Sparkles className="h-4 w-4" /> AI studio
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-[#0B1022] dark:text-[#E5E7EB]">
            <Gauge className="h-4 w-4" aria-hidden /> Usage {usage ?? "?"}/20
          </span>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-[#E5E7EB]">Generate study-ready content</h1>
          <p className="max-w-3xl text-slate-600 dark:text-[#94A3B8]">
            Pick the format, add your topic, adjust options, and create in one focused view.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022]">
        <CardHeader className="flex flex-col gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-900 dark:text-[#E5E7EB]">
              <Wand2 className="h-5 w-5 text-purple-600" />
              Generation prompt
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-[#94A3B8]">
              Minimal fields and clear options to generate your set.
            </CardDescription>
          </div>
          <div
            className="self-start rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-[#0B1022] dark:text-[#E5E7EB]"
            aria-live="polite"
          >
            {limitReached ? "Limit reached" : "Credits OK"}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choose output type">
            {(["flashcards", "quiz"] as Tool[]).map((t) => {
              const isActive = tool === t;
              return (
                <Button
                  key={t}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  aria-pressed={isActive}
                  title={`Generate ${t}`}
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
        </CardHeader>
        <CardContent className="space-y-6">
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-slate-700 dark:text-[#E5E7EB]" htmlFor="count">
                    Count
                  </Label>
                  <Info className="h-4 w-4 text-slate-400" aria-hidden />
                  <span className="sr-only">Choose how many items to generate</span>
                </div>
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-700 dark:text-[#E5E7EB]" htmlFor="difficulty">
                      Difficulty
                    </Label>
                    <Info className="h-4 w-4 text-slate-400" aria-hidden />
                    <span className="sr-only">Describe the level, e.g. easy, medium, hard</span>
                  </div>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-slate-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB] dark:focus:border-purple-400 dark:focus:ring-purple-900/40"
                >
                  {["easy", "medium", "hard"].map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
                </div>
              </div>
            </div>

          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-[#E5E7EB]" htmlFor="topic">
              Topic or paste text
            </Label>
            <Textarea
              id="topic"
              minLength={4}
              rows={7}
              placeholder={defaultPrompt}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 dark:border-[#1F2A44] dark:bg-[#0B1022] dark:text-[#E5E7EB] dark:placeholder:text-[#94A3B8]"
            />
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Tip: add bullet points for key facts; we'll structure them for the chosen format.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleGenerate}
              disabled={loading || limitReached}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow hover:shadow-md"
              aria-busy={loading}
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
              variant="ghost"
              disabled={!loading}
              className="text-slate-700 hover:bg-slate-100 dark:text-[#E5E7EB] dark:hover:bg-slate-900/60"
            >
              Cancel
            </Button>
            <Link href="/library" className="ml-auto">
              <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-[#1F2A44] dark:text-[#E5E7EB] dark:hover:bg-[#0B1022]">
                Library
              </Button>
            </Link>
            {error && (
              <p className="text-sm text-red-500 dark:text-red-300" role="alert" aria-live="assertive">
                {error}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-[#1F2A44] dark:bg-[#0B1022]">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900 dark:text-[#E5E7EB]">Feedback</CardTitle>
          <CardDescription className="text-slate-600 dark:text-[#94A3B8]">
            Capture quick user feedback after generation to keep improving.
          </CardDescription>
        </CardHeader>
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
      </Card>
    </div>
  );
}
