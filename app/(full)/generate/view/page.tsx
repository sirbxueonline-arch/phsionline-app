"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flashcard } from "@/components/Flashcard";
import { QuizQuestion } from "@/components/QuizQuestion";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, BookmarkCheck, Clock3, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

type FullResult =
  | { flashcards: { question: string; answer: string }[]; mocked?: boolean; type?: string; title?: string; subject?: string }
  | { quiz: any[]; mocked?: boolean; type?: string; title?: string; subject?: string }
  | { plan: string[]; mocked?: boolean; type?: string; title?: string; subject?: string }
  | { explanation: string; mocked?: boolean; type?: string; title?: string; subject?: string }
  | null;

export default function FullscreenGenerateView() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const data = params.get("data");
  const decoded: FullResult = useMemo(() => {
    if (!data) return null;
    try {
      const encoded = decodeURIComponent(data);
      const binary = atob(encoded);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const jsonStr = new TextDecoder().decode(bytes);
      const payload = JSON.parse(jsonStr);
      return payload;
    } catch (err) {
      console.error("Failed to parse full view data", err);
      return null;
    }
  }, [data]);

  const quizItems = useMemo(() => {
    if (!decoded || !("quiz" in decoded)) return null;
    return Array.isArray(decoded.quiz) ? decoded.quiz : [];
  }, [decoded]);

  const totalQuestions = quizItems?.length ?? 0;
  const correctCount = useMemo(() => {
    if (!quizItems || !showResult) return 0;
    return quizItems.reduce((sum, q, idx) => {
      const selected = answers[idx];
      const normalize = (val: string) => (val || "").trim().toLowerCase();
      return sum + (selected && normalize(selected) === normalize(q.answer) ? 1 : 0);
    }, 0);
  }, [quizItems, answers, showResult]);

  const flashcards = useMemo(() => {
    if (!decoded || !("flashcards" in decoded)) return null;
    return Array.isArray(decoded.flashcards) ? decoded.flashcards : [];
  }, [decoded]);

  useEffect(() => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  }, [totalQuestions]);

  useEffect(() => {
    setCurrentCard(0);
    setCardFlipped(false);
  }, [flashcards?.length]);

  useEffect(() => {
    setCardFlipped(false);
  }, [currentCard]);

  const handleSave = async () => {
    if (!decoded || !user) return;
    setSaving(true);
    const client = await getSupabaseClient();
    if (!client) {
      setSaving(false);
      return;
    }
    const type = (decoded as any).type || "generated";
    const title = (decoded as any).title || `Generated ${type}`;
    const subject = (decoded as any).subject || null;
    const { error } = await client.from("resources").insert({
      user_id: user.uid,
      type,
      title,
      subject,
      content: decoded
    });
    if (error) {
      console.error("Save failed", error);
    }
    setSaving(false);
  };

  const renderContent = () => {
    if (!decoded) return <p className="text-sm text-slate-400">No result found. Regenerate to view.</p>;
    if ("flashcards" in decoded) {
      if (!flashcards || !flashcards.length) {
        return <p className="text-sm text-slate-400">No flashcards available.</p>;
      }
      const card = flashcards[Math.min(currentCard, flashcards.length - 1)];
      const goNextCard = () => setCurrentCard((n) => Math.min(n + 1, flashcards.length - 1));
      const goPrevCard = () => setCurrentCard((n) => Math.max(0, n - 1));

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>
              Card {currentCard + 1} of {flashcards.length}
            </span>
            <span className="text-xs uppercase tracking-wide text-slate-500">Tap or flip</span>
          </div>
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-800/70 bg-slate-950/50 p-4 sm:p-6">
            <Flashcard item={card} flipped={cardFlipped} onFlip={setCardFlipped} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <span className="h-2 w-2 rounded-full bg-cyan-400" /> Interactive mode
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={goPrevCard}
                  disabled={currentCard === 0}
                  className="border-slate-700 text-slate-200 hover:border-slate-500"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={goNextCard}
                  disabled={currentCard === flashcards.length - 1}
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-900 shadow-lg"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    if ("quiz" in decoded) {
      if (!quizItems || !quizItems.length) {
        return <p className="text-sm text-slate-400">No quiz questions available.</p>;
      }
      const idx = Math.min(currentQuestion, quizItems.length - 1);
      const item = quizItems[idx];
      const selected = answers[idx];
      const isLast = idx === quizItems.length - 1;
      const answered = typeof selected === "string" && selected.length > 0;
      const showFeedback = false;

      const handleSelect = (choice: string) => {
        setAnswers((prev) => ({ ...prev, [idx]: choice }));
      };

      const goNext = () => {
        if (!answered) return;
        if (isLast) {
          setShowResult(true);
        } else {
          setCurrentQuestion((n) => Math.min(n + 1, quizItems.length - 1));
        }
      };

      const goPrev = () => {
        setShowResult(false);
        setCurrentQuestion((n) => Math.max(0, n - 1));
      };

      if (showResult) {
        const percent = quizItems.length ? Math.round((correctCount / quizItems.length) * 100) : 0;
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-400">Quiz complete</p>
                <p className="text-3xl font-semibold text-white">
                  Score: {correctCount}/{quizItems.length} ({percent}%)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setShowResult(false)}>
                  Review answers
                </Button>
                <Button
                  onClick={() => {
                    setAnswers({});
                    setCurrentQuestion(0);
                    setShowResult(false);
                  }}
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-900 shadow-lg"
                >
                  Retry quiz
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {quizItems.map((q: any, i: number) => {
                const sel = answers[i];
                const correct = sel === q.answer;
                return (
                  <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-sm uppercase tracking-wide text-slate-400 mb-2">Question {i + 1}</p>
                    <p className="text-lg font-semibold text-white">{q.question}</p>
                    <p className={`mt-2 text-sm ${correct ? "text-emerald-300" : "text-red-300"}`}>
                      {correct ? "Correct" : `Incorrect (correct: ${q.answer || "n/a"})`}
                    </p>
                    {q.explanation && <p className="mt-2 text-sm text-slate-300">{q.explanation}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>
              Question {idx + 1} of {quizItems.length}
            </span>
            <span className="text-xs uppercase tracking-wide text-slate-500">Auto-advance on answer</span>
          </div>
          <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-4 sm:p-6">
            <QuizQuestion item={item} selected={selected} onSelect={handleSelect} showFeedback={showFeedback} />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <span className="h-2 w-2 rounded-full bg-cyan-400" /> Progress {idx + 1}/{quizItems.length}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={goPrev}
                  disabled={idx === 0}
                  className="border-slate-700 text-slate-200 hover:border-slate-500"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={goNext}
                  disabled={!answered}
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-900 shadow-lg"
                >
                  {isLast ? "Finish" : "Next"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    if ("plan" in decoded) {
      return (
        <ol className="list-decimal space-y-2 pl-4 text-lg">
          {decoded.plan.map((step: string, idx: number) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      );
    }
    if ("explanation" in decoded) {
      return <p className="text-lg leading-relaxed">{decoded.explanation}</p>;
    }
    return <p className="text-sm text-slate-400">Unsupported content.</p>;
  };

  const isMock = !!(decoded as any)?.mocked;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 light-gradient-bg dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.15),transparent_35%),radial-gradient(circle_at_80%_15%,rgba(124,58,237,0.16),transparent_30%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-16 pt-16 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" className="w-fit text-slate-100 hover:text-white" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Clock3 className="h-4 w-4" />
            {formatDate(new Date())}
          </div>
        </div>

        <Card className="border-slate-200 bg-white/90 text-slate-900 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:text-white">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                <span className="rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">
                  {(decoded as any)?.type || "Generated"}
                </span>
                {(decoded as any)?.subject && (
                  <span className="rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">
                    {(decoded as any).subject}
                  </span>
                )}
                {isMock && (
                  <span className="rounded-full bg-amber-400/20 px-2 py-1 text-amber-100 ring-1 ring-amber-300/40">
                    Mock data
                  </span>
                )}
              </div>
              <CardTitle className="text-2xl">{(decoded as any)?.title || "Generated content"}</CardTitle>
              <CardDescription className="text-slate-300">
                Full-screen focus view. Save to your library to study later.
              </CardDescription>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !decoded}
              className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-900 shadow-lg"
            >
              {saving ? (
                "Saving..."
              ) : (
                <span className="flex items-center gap-2">
                  <BookmarkCheck className="h-4 w-4" /> Save to library
                </span>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
              <p className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-500 dark:text-cyan-300" />
                Tip: share or export from the library after saving. This view keeps things focused for study.
              </p>
            </div>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
