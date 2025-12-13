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
    <Card className="relative cursor-pointer overflow-hidden" onClick={toggle}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4 }}
        className="preserve-3d"
      >
        <div className="backface-hidden">
          <p className="text-sm uppercase text-slate-500">Question</p>
          <p className="text-lg font-semibold">{item.question}</p>
        </div>
        <div className="absolute inset-0 flex backface-hidden rotateY-180">
          <div className="w-full">
            <p className="text-sm uppercase text-slate-500">Answer</p>
            <p className="text-lg font-semibold">{item.answer}</p>
          </div>
        </div>
      </motion.div>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
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
