"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type Resource = {
  id: string;
  title: string;
  type: string;
  content: any;
};

export default function StudySessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      if (!user || !params?.id) return;
      const snap = await getDoc(doc(db, "resources", params.id as string));
      if (snap.exists()) {
        const data = snap.data() as any;
        if (data.userId === user.uid && data.type !== "usage-log") {
          setResource({ id: snap.id, ...data });
        }
      }
    };
    fetchResource();
  }, [params, user]);

  if (!resource) return <p className="text-sm text-slate-500">Loading session...</p>;

  const flashcards = resource.content?.flashcards || [];
  const quiz = resource.content?.quiz || [];

  const handleNext = () => {
    setShowAnswer(false);
    if (resource.type === "flashcards" && idx < flashcards.length - 1) {
      setIdx((i) => i + 1);
    } else if (resource.type === "quiz" && idx < quiz.length - 1) {
      setIdx((i) => i + 1);
    } else {
      setComplete(true);
    }
  };

  const handleChoice = (option: string) => {
    if (quiz[idx].answer === option) setScore((s) => s + 1);
    handleNext();
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        ← Exit
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{resource.title}</CardTitle>
          <p className="text-sm text-slate-500">
            {resource.type === "flashcards"
              ? `Card ${Math.min(idx + 1, flashcards.length)} of ${flashcards.length}`
              : `Question ${Math.min(idx + 1, quiz.length)} of ${quiz.length}`}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {complete ? (
            <div className="space-y-3">
              <p className="text-lg font-semibold">Session complete!</p>
              {resource.type === "quiz" && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Score: {score} / {quiz.length}
                </p>
              )}
              <Button onClick={() => router.push("/dashboard")}>Back to dashboard</Button>
            </div>
          ) : resource.type === "flashcards" ? (
            <>
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-sm uppercase text-slate-500">Question</p>
                <p className="text-lg font-semibold">{flashcards[idx]?.question}</p>
              </div>
              {showAnswer && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                  <p className="text-sm uppercase text-emerald-700 dark:text-emerald-200">Answer</p>
                  <p className="text-lg font-semibold">{flashcards[idx]?.answer}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={() => setShowAnswer(true)} variant="outline">
                  Reveal answer
                </Button>
                <Button onClick={handleNext}>Next</Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm uppercase text-slate-500">Question</p>
                <p className="text-lg font-semibold">{quiz[idx]?.question}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {quiz[idx]?.options?.map((opt: string) => (
                  <Button key={opt} variant="outline" className="justify-start" onClick={() => handleChoice(opt)}>
                    {opt}
                  </Button>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
