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

export const QuizQuestion = ({ item }: { item: QuizItem }) => {
  const [choice, setChoice] = React.useState<string | null>(null);
  const correct = choice && choice === item.answer;
  const options = React.useMemo(
    () =>
      item.options && item.options.length > 0
        ? item.options.map((opt, idx) => opt || `Option ${String.fromCharCode(65 + idx)}`)
        : ["Option A", "Option B", "Option C", "Option D"],
    [item.options]
  );

  return (
    <Card className="space-y-3">
      <div>
        <p className="text-sm uppercase text-slate-500">Question</p>
        <p className="text-lg font-semibold">{item.question}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <Button
            key={opt}
            variant={choice === opt ? "default" : "outline"}
            className="justify-start"
            onClick={() => setChoice(opt)}
          >
            {opt}
          </Button>
        ))}
      </div>
      {choice && (
        <div className="rounded-lg border border-slate-200/70 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="font-medium">{correct ? "Correct!" : "Not quite."}</p>
          <p>
            Correct answer: <span className="font-semibold">{item.answer}</span>
          </p>
          {item.explanation && <p className="text-slate-600 dark:text-slate-300">{item.explanation}</p>}
        </div>
      )}
    </Card>
  );
};
