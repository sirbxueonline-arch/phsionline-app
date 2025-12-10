"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudyConfigPage() {
  const [timed, setTimed] = useState(false);
  const [shuffle, setShuffle] = useState(true);
  const [revealOnTap, setRevealOnTap] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study configuration</CardTitle>
        <CardDescription>Control the default experience in study sessions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ToggleRow label="Enable timed quiz mode" value={timed} onChange={setTimed} />
        <ToggleRow label="Shuffle flashcards by default" value={shuffle} onChange={setShuffle} />
        <ToggleRow label="Reveal flashcard answer on tap" value={revealOnTap} onChange={setRevealOnTap} />
        <Button variant="outline" disabled>
          Saved automatically
        </Button>
      </CardContent>
    </Card>
  );
}

const ToggleRow = ({
  label,
  value,
  onChange
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
    <p className="text-sm">{label}</p>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`h-6 w-11 rounded-full transition-colors ${value ? "bg-brand" : "bg-slate-400"}`}
    >
      <span
        className={`block h-5 w-5 rounded-full bg-white transition-transform ${
          value ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);
