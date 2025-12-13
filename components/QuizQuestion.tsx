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
    <Card className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-xl">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Question</p>
        <p className="text-xl font-semibold text-slate-50">{item.question}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const isSelected = currentChoice === opt;
          return (
            <Button
              key={opt}
              variant={isSelected ? "default" : "outline"}
              className={`h-12 justify-start text-left text-base ${
                isSelected
                  ? "bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-900"
                  : "border-slate-700 text-slate-100 hover:border-cyan-400"
              }`}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </Button>
          );
        })}
      </div>
      {showFeedback && currentChoice && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-200">
          <p className="font-semibold">{correct ? "Correct!" : "Not quite."}</p>
          {item.explanation && <p className="mt-1 text-slate-300">{item.explanation}</p>}
        </div>
      )}
    </Card>
  );
};
