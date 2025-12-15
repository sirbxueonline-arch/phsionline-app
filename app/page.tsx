"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const ROTATING_TOPICS = [
  "AP Bio: Photosynthesis vs. Cellular Respiration",
  "APUSH: Causes of World War I",
  "Chemistry: Naming ionic compounds",
  "Psych: Operant vs. Classical Conditioning",
  "Calculus: Derivatives of trig functions"
];

export default function LandingPage() {
  const router = useRouter();
  const rotatingTopics = ROTATING_TOPICS;

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [topic, setTopic] = useState("");
  const [showControls, setShowControls] = useState(false);
  const [cardCount, setCardCount] = useState(12);
  const [difficulty, setDifficulty] = useState<"Review" | "Exam-Style" | "Hard Mode">("Exam-Style");

  useEffect(() => {
    const id = setInterval(
      () => setPlaceholderIndex((prev) => (prev + 1) % ROTATING_TOPICS.length),
      3200
    );
    return () => clearInterval(id);
  }, []);

  const handlePrimaryCTA = () => {
    if (!showControls) {
      setShowControls(true);
      return;
    }
    router.push("/auth/signup");
  };

  return (
    <main className="relative overflow-visible bg-gradient-to-b from-white via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col-reverse items-center gap-10 px-4 pb-16 pt-24 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200/70 dark:bg-white/10 dark:text-slate-100 dark:ring-white/15">
            Built for tests, not notes
          </div>
          <div className="space-y-3">
            <h1 className="font-display text-4xl leading-tight text-slate-900 md:text-5xl dark:text-white">
              Built for exams, not endless notes
            </h1>
            <p className="max-w-2xl text-lg text-slate-700 dark:text-slate-200">
              Turn any topic into flashcards and quizzes that match real exam questions.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/80">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Topic
                </p>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={rotatingTopics[placeholderIndex]}
                  className="h-12 text-base placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
              </div>
              <Button
                size="lg"
                className="w-full bg-slate-900 text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                onClick={handlePrimaryCTA}
              >
                Create my first study set
              </Button>
              <p className="text-center text-sm text-slate-600 dark:text-slate-300">Takes about 30 seconds.</p>
            </div>

            {showControls && (
              <div className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">Card count</p>
                  <div className="flex flex-wrap gap-2">
                    {[12, 16, 24].map((count) => (
                      <Button
                        key={count}
                        variant={cardCount === count ? "default" : "outline"}
                        className={`flex-1 min-w-[90px] ${cardCount === count ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : ""}`}
                        onClick={() => setCardCount(count)}
                      >
                        {count} cards
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">Difficulty</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Review", "Exam-Style", "Hard Mode"] as const).map((level) => (
                      <Button
                        key={level}
                        variant={difficulty === level ? "default" : "outline"}
                        className={difficulty === level ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : ""}
                        onClick={() => setDifficulty(level)}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                  onClick={() => router.push("/auth/signup")}
                >
                  Save and start studying
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 w-full max-w-xl">
          <Card className="card-glow bg-white/90 text-slate-900 shadow-xl backdrop-blur dark:bg-slate-900/80 dark:text-white">
            <CardHeader className="pb-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">What you&apos;ll actually study</p>
              <CardTitle className="text-2xl">AP Bio snapshot</CardTitle>
              <CardDescription>Flashcards + quiz in the same lane.</CardDescription>
            </CardHeader>
            <div className="space-y-3 p-5 pt-0">
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-left text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Flashcard
                </p>
                <p className="mt-2 text-base font-semibold">
                  What triggers the depolarization phase of an action potential?
                </p>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                  Voltage-gated sodium channels opening, letting Na+ rush into the neuron.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Quiz
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                  Which ion initiates an action potential?
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-800 dark:text-slate-100">
                  {["Potassium", "Calcium", "Sodium", "Chloride"].map((option, idx) => (
                    <li
                      key={option}
                      className={`rounded-md px-3 py-2 ring-1 ring-slate-200 dark:ring-slate-800 ${idx === 2 ? "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-100 dark:ring-emerald-800" : "bg-white dark:bg-slate-800/60"}`}
                    >
                      {String.fromCharCode(65 + idx)}. {option}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">Correct: C</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl space-y-6 px-4 pb-6">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-center text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200">
          Type a topic, choose how hard you want it, then study with flashcards and exam-style questions.
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl space-y-4 px-4 pb-10">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Benefits
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Built for tests, not notes</h2>
        </div>
        <ul className="grid gap-3 md:grid-cols-3">
          {[
            "Only covers what's tested - skips textbook fluff.",
            "Flags common trick answers so you don't memorize half-truths.",
            "Trains recall speed so you finish multiple-choice on time."
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-10">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Private by default | Never sold | Delete your data anytime</span>
          <Lock className="h-4 w-4 text-slate-500" />
        </div>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-6xl space-y-8 px-4 pb-16">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Pricing
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Simple, student-first plans</h2>
          <p className="text-slate-600 dark:text-slate-300">Start free. Upgrade only when you need more cards.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              name: "Free",
              price: "$0",
              tagline: "Great for weekly quizzes or a quick cram session.",
              features: ["Up to 20 cards per set", "3 study sets per day", "Flashcards + quizzes included"]
            },
            {
              name: "Pro",
              price: "$9/mo",
              tagline: "Best for finals week, AP exams, and heavy subjects when volume matters.",
              features: [
                "Larger sets and faster generations",
                "Unlimited study sets",
                "Keep your sets organized and see which cards you keep missing so you know what to re-drill."
              ]
            }
          ].map((plan) => (
            <Card
              key={plan.name}
              className="flex h-full flex-col border border-slate-200/80 bg-white/95 text-left shadow-xl dark:border-slate-800/70 dark:bg-slate-900/80"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-200">{plan.price}</span>
                </div>
                <CardDescription>{plan.tagline}</CardDescription>
              </CardHeader>
              <div className="space-y-2 px-6 pb-6 text-sm text-slate-700 dark:text-slate-200">
                {plan.features.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
