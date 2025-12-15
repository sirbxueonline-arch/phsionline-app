"use client";

import { useMemo, useState } from "react";
import { Sparkles, Target } from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

type Difficulty = "gentle" | "steady" | "intense";

type DemoPreview = {
  flashcardQuestion: string;
  flashcardAnswer: string;
  quizQuestion: string;
  quizOptions: string[];
  quizAnswer: string;
};

const difficultyCopy: Record<Difficulty, string> = {
  gentle: "Warm-up mode",
  steady: "Exam ready",
  intense: "Challenge me"
};

const makePreview = (topic: string, difficulty: Difficulty, cardCount: number): DemoPreview => {
  const subject = topic.trim() || "your topic";
  const focus = {
    gentle: "friendly walkthroughs and clear examples",
    steady: "the must-know ideas, definitions, and why they matter",
    intense: "edge cases, comparisons, and the small details that show up on exams"
  }[difficulty];

  return {
    flashcardQuestion: `Why does ${subject} matter for your test?`,
    flashcardAnswer: `We'll craft ${cardCount} cards that cover the core idea, the steps or parts, and a quick example so you can recall ${subject} fast. This set leans on ${focus}.`,
    quizQuestion: `Which statement best proves you understand ${subject}?`,
    quizOptions: [
      `${subject} only matters in theory and rarely shows up in practice.`,
      `${subject} connects key terms with real outcomes, which is why teachers ask about it.`,
      `${subject} is impossible to simplify without memorizing a textbook.`,
      `${subject} should be skipped because it is too advanced for any quiz.`
    ],
    quizAnswer: "Option 2 — it ties concepts to results, so you can explain it instead of memorizing it."
  };
};

export const InteractiveDemo = () => {
  const [topic, setTopic] = useState("Photosynthesis");
  const [cardCount, setCardCount] = useState(8);
  const [difficulty, setDifficulty] = useState<Difficulty>("steady");

  const preview = useMemo(() => makePreview(topic, difficulty, cardCount), [topic, difficulty, cardCount]);

  return (
    <Card className="shadow-2xl">
      <CardHeader className="gap-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-100 dark:ring-indigo-700/40">
          <Sparkles className="h-3.5 w-3.5" /> Try it now
        </div>
        <CardTitle className="text-2xl">Enter a topic. Preview a study set instantly.</CardTitle>
        <CardDescription>
          No login needed—see the type of flashcards and quiz questions students get before you commit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4 rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70">
            <label className="space-y-2 text-sm font-medium text-slate-800 dark:text-slate-100">
              Topic
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. The French Revolution, supply and demand, mitosis"
              />
            </label>
            <div className="space-y-2 text-sm font-medium text-slate-800 dark:text-slate-100">
              Card count: <span className="text-indigo-600 dark:text-indigo-200">{cardCount} cards</span>
              <input
                type="range"
                min={4}
                max={20}
                step={1}
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <p className="text-xs font-normal text-slate-500 dark:text-slate-300">
                Control the length so it fits your study window.
              </p>
            </div>
            <div className="space-y-2 text-sm font-medium text-slate-800 dark:text-slate-100">
              Difficulty
              <div className="flex flex-wrap gap-2">
                {(["gentle", "steady", "intense"] as Difficulty[]).map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={difficulty === level ? "default" : "outline"}
                    className={cn(
                      "capitalize",
                      difficulty === level && "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                    )}
                    onClick={() => setDifficulty(level)}
                  >
                    {difficultyCopy[level]}
                  </Button>
                ))}
              </div>
              <p className="text-xs font-normal text-slate-500 dark:text-slate-300">
                Tune the challenge so quizzes feel like the real thing.
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              <Target className="h-4 w-4" />
              Preview
            </div>
            <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-100 dark:ring-indigo-700/40">
              <span>{cardCount} cards</span>
              <span>Difficulty: {difficultyCopy[difficulty]}</span>
            </div>
            <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 text-left text-slate-900 shadow-sm dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800 dark:text-white">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Flashcard</p>
              <p className="text-lg font-semibold">{preview.flashcardQuestion}</p>
              <p className="text-sm text-slate-700 dark:text-slate-100/90">{preview.flashcardAnswer}</p>
            </div>
            <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 text-left text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-white">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Quiz question</p>
              <p className="text-lg font-semibold">{preview.quizQuestion}</p>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-100/90">
                {preview.quizOptions.map((option, idx) => (
                  <li key={option} className="rounded-md bg-slate-50 px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-slate-800">
                    <span className="mr-2 font-semibold text-indigo-600 dark:text-indigo-200">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {option}
                  </li>
                ))}
              </ul>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{preview.quizAnswer}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
