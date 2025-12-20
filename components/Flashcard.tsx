"use client";

import { motion } from "framer-motion";
import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

export type FlashcardItem = { question: string; answer: string };

export const Flashcard = ({
  item,
  flipped: controlledFlipped,
  onFlip
}: {
  item: FlashcardItem;
  flipped?: boolean;
  onFlip?: (flipped: boolean) => void;
}) => {
  const [internalFlipped, setInternalFlipped] = React.useState(false);
  const flipped = controlledFlipped ?? internalFlipped;
  const toggle = () => {
    if (controlledFlipped === undefined) {
      setInternalFlipped((f) => !f);
    }
    onFlip?.(!flipped);
  };
  return (
    <Card
      className="relative flex min-h-[320px] w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition hover:border-purple-300/60 hover:shadow-purple-500/10 dark:border-slate-800/70 dark:bg-slate-900/80"
      style={{ perspective: "1200px" }}
      onClick={toggle}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4 }}
        className="relative flex h-full w-full items-center justify-center text-center preserve-3d"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="backface-hidden w-full" style={{ backfaceVisibility: "hidden" }}>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Question</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-50">{item.question}</p>
        </div>
        <div
          className="absolute inset-0 flex backface-hidden rotateY-180"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex w-full flex-col items-center justify-center text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Answer</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-50">{item.answer}</p>
          </div>
        </div>
      </motion.div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
      <div className="absolute right-4 top-4 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tap or Flip</div>
      <Button
        variant="outline"
        size="sm"
        className="pointer-events-auto absolute bottom-4 right-4 border-slate-300 text-slate-700 hover:border-purple-300 dark:border-slate-700 dark:text-slate-100 dark:hover:border-purple-400"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
      >
        Flip
      </Button>
    </Card>
  );
};
