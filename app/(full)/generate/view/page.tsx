"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flashcard } from "@/components/Flashcard";
import { QuizQuestion } from "@/components/QuizQuestion";
import { useAuth } from "@/components/AuthProvider";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, BookmarkCheck, Clock3, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

type FullResult = {
  flashcards?: { question: string; answer: string }[];
  quiz?: any[];
  plan?: string[];
  explanation?: string;
  mocked?: boolean;
  type?: string;
  title?: string;
  subject?: string;
} | null;

export default function FullscreenGenerateView() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
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
    if (!decoded || !("quiz" in decoded)) return [];
    return Array.isArray(decoded.quiz) ? decoded.quiz : [];
  }, [decoded]);

  const totalQuestions = quizItems.length;
  const correctCount = useMemo(() => {
    if (!quizItems.length || !showResult) return 0;
    return quizItems.reduce((sum, q, idx) => {
      const selected = answers[idx];
      const normalize = (val: string) => (val || "").trim().toLowerCase();
      return sum + (selected && normalize(selected) === normalize(q.answer) ? 1 : 0);
    }, 0);
  }, [quizItems, answers, showResult]);

  const flashcards = useMemo(() => {
    if (!decoded || !("flashcards" in decoded)) return [];
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
  }, [flashcards.length]);

  useEffect(() => {
    setCardFlipped(false);
  }, [currentCard]);

  const renderFlashcardsSection = () => {
    if (!flashcards.length) {
      return <p className="text-sm text-slate-400">No flashcards available.</p>;
    }
    const card = flashcards[Math.min(currentCard, flashcards.length - 1)];
    const goNextCard = () => setCurrentCard((n) => Math.min(n + 1, flashcards.length - 1));
    const goPrevCard = () => setCurrentCard((n) => Math.max(0, n - 1));

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>
            Card {currentCard + 1} of {flashcards.length}
          </span>
          <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tap or flip</span>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/50 sm:p-6">
          <Flashcard item={card} flipped={cardFlipped} onFlip={setCardFlipped} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400" /> Interactive mode
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={goPrevCard}
                disabled={currentCard === 0}
                className="border-slate-300 text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
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
  };

  const renderQuizSection = () => {
    if (!quizItems.length) {
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
              <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Quiz complete</p>
              <p className="text-3xl font-semibold text-slate-900 dark:text-white">
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
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="mb-2 text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Question {i + 1}</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{q.question}</p>
                  <p className={`mt-2 text-sm ${correct ? "text-emerald-600 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}>
                    {correct ? "Correct" : `Incorrect (correct: ${q.answer || "n/a"})`}
                  </p>
                  {q.explanation && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{q.explanation}</p>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>
            Question {idx + 1} of {quizItems.length}
          </span>
          <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Auto-advance on answer</span>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/50 sm:p-6">
          <QuizQuestion item={item} selected={selected} onSelect={handleSelect} showFeedback={showFeedback} />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400" /> Progress {idx + 1}/{quizItems.length}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={idx === 0}
                className="border-slate-300 text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
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
  };

  const handleSave = async () => {
    if (!decoded) {
      setSaveFeedback({ type: "error", message: "Nothing to save yet. Generate content first." });
      return;
    }
    if (!user) {
      setSaveFeedback({ type: "error", message: "Sign in to save this to your library." });
      return;
    }
    setSaving(true);
    setSaveFeedback(null);
    const type =
      (decoded as any).type ||
      (decoded && "quiz" in decoded && "flashcards" in decoded
        ? "both"
        : decoded && "quiz" in decoded
        ? "quiz"
        : decoded && "flashcards" in decoded
        ? "flashcards"
        : "generated");
    const title = (decoded as any).title || `Generated ${type}`;
    const subject = (decoded as any).subject || null;
    try {
      const token = await user.getIdToken?.();
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ content: decoded, type, title, subject })
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.error || "Save failed");
      }
      setSaveFeedback({ type: "success", message: "Saved to your library." });
    } catch (err: any) {
      console.error("Save failed", err);
      setSaveFeedback({ type: "error", message: err?.message || "Save failed. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (!decoded) return <p className="text-sm text-slate-400">No study set yet. Create one to start practicing.</p>;
    const hasFlashcardsProp = "flashcards" in decoded;
    const hasQuizProp = "quiz" in decoded;
    const hasFlashcards = hasFlashcardsProp && flashcards.length > 0;
    const hasQuiz = hasQuizProp && quizItems.length > 0;

    if (hasFlashcards && hasQuiz) {
      return (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Flashcards</p>
            {renderFlashcardsSection()}
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Quiz</p>
            {renderQuizSection()}
          </div>
        </div>
      );
    }
    if (hasFlashcards) {
      return renderFlashcardsSection();
    }
    if (hasQuiz) {
      return renderQuizSection();
    }
    if (hasFlashcardsProp && hasQuizProp) {
      return <p className="text-sm text-slate-400">No flashcards or quiz questions available.</p>;
    }
    if (hasFlashcardsProp) {
      return <p className="text-sm text-slate-400">No flashcards available.</p>;
    }
    if (hasQuizProp) {
      return <p className="text-sm text-slate-400">No quiz questions available.</p>;
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
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="absolute inset-0 hidden dark:block gradient-bg" aria-hidden="true" />
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-6 pb-16 pt-12">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200/60 shadow-sm dark:bg-white/5 dark:ring-white/5">
          <Button
            variant="ghost"
            className="w-fit text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Clock3 className="h-4 w-4" />
            {formatDate(new Date())}
          </div>
        </div>

        <Card className="flex min-h-[90vh] flex-col border-white/10 bg-white text-slate-900 shadow-2xl backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/85 dark:text-white overflow-hidden">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/15">
                  {(decoded as any)?.type || "Generated"}
                </span>
                {(decoded as any)?.subject && (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/15">
                    {(decoded as any).subject}
                  </span>
                )}
                {isMock && (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-400/20 dark:text-amber-100 dark:ring-amber-300/40">
                    Mock data
                  </span>
                )}
              </div>
              <CardTitle className="text-2xl">{(decoded as any)?.title || "Generated content"}</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Full-screen focus view. Save to your library to study later.
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              {saveFeedback && (
                <p
                  className={`text-sm ${saveFeedback.type === "success" ? "text-emerald-600 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}
                >
                  {saveFeedback.message}
                </p>
              )}
              <Button onClick={handleSave} disabled={saving || !decoded} className="rounded-full bg-gradient-to-r from-brand to-indigo-500 text-white shadow-lg">
                {saving ? (
                  "Saving..."
                ) : (
                  <span className="flex items-center gap-2">
                    <BookmarkCheck className="h-4 w-4" /> Save to library
                  </span>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <p className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-500 dark:text-cyan-300" />
                Want to test yourself now? Flip through below or jump to study mode after saving.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                <Link href="/study" className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/10">
                  Open study
                </Link>
                <span>Saving keeps progress in your library.</span>
              </div>
            </div>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
