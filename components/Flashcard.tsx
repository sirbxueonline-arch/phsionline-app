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
      className="relative flex min-h-[280px] w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-xl transition hover:border-cyan-400/40 hover:shadow-cyan-500/10"
      style={{ perspective: "1200px" }}
      onClick={toggle}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4 }}
        className="preserve-3d flex w-full items-center justify-center text-center"
      >
        <div className="backface-hidden w-full">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Question</p>
          <p className="mt-3 text-2xl font-semibold text-slate-50">{item.question}</p>
        </div>
        <div className="absolute inset-0 flex backface-hidden rotateY-180">
          <div className="flex w-full flex-col items-center justify-center text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Answer</p>
            <p className="mt-3 text-2xl font-semibold text-emerald-200">{item.answer}</p>
          </div>
        </div>
      </motion.div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
      <div className="absolute right-4 top-4 text-xs uppercase tracking-wide text-slate-500">Tap or Flip</div>
      <Button
        variant="outline"
        size="sm"
        className="pointer-events-auto absolute bottom-4 right-4 border-slate-700 text-slate-100 hover:border-cyan-400 hover:text-white"
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
