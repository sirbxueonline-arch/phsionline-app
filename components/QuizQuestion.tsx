"use client";

import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

export type QuizItem = {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
};

export const QuizQuestion = ({
  item,
  selected,
  onSelect,
  showFeedback = true
}: {
  item: QuizItem;
  selected?: string | null;
  onSelect?: (choice: string) => void;
  showFeedback?: boolean;
}) => {
  const [choice, setChoice] = React.useState<string | null>(selected ?? null);
  const currentChoice = selected ?? choice;
  const correct = currentChoice && currentChoice === item.answer;
  const options = React.useMemo(
    () =>
      item.options && item.options.length > 0
        ? item.options.map((opt, idx) => opt || `Option ${String.fromCharCode(65 + idx)}`)
        : ["Option A", "Option B", "Option C", "Option D"],
    [item.options]
  );

  const handleSelect = (opt: string) => {
    setChoice(opt);
    onSelect?.(opt);
  };

  return (
    <Card className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800/70 dark:bg-slate-900/80">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Question</p>
        <p className="text-xl font-semibold leading-relaxed text-slate-900 dark:text-slate-50">{item.question}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((opt) => {
          const isSelected = currentChoice === opt;
          return (
            <Button
              key={opt}
              variant={isSelected ? "default" : "outline"}
              className={`w-full h-auto min-h-[56px] justify-start rounded-xl text-left text-base whitespace-normal break-words leading-relaxed ${
                isSelected
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                  : "border-slate-300 text-slate-900 hover:border-purple-300/70 hover:bg-purple-50/70 dark:border-slate-700 dark:text-slate-100 dark:hover:border-purple-400/60 dark:hover:bg-slate-900"
              }`}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </Button>
          );
        })}
      </div>
      {showFeedback && currentChoice && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200">
          <p className="font-semibold">{correct ? "Correct!" : "Not quite."}</p>
          {item.explanation && <p className="mt-1 text-slate-600 dark:text-slate-300">{item.explanation}</p>}
        </div>
      )}
    </Card>
  );
};
