import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Gauge,
  Lock,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap
} from "lucide-react";

import { InteractiveDemo } from "@/components/InteractiveDemo";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main className="relative overflow-visible">
      <div className="absolute inset-0 light-gradient-bg blur-3xl opacity-90 dark:gradient-bg" />
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/80 via-white/50 to-transparent dark:from-slate-900/70 dark:via-slate-900/30" />

      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center gap-12 px-4 pb-20 pt-28 text-center lg:flex-row lg:text-left">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/60 dark:bg-white/10 dark:text-slate-200 dark:ring-white/20">
            <Sparkles className="h-4 w-4" /> Built for exam weeks
          </div>
          <h1 className="font-display text-4xl leading-tight text-slate-900 md:text-5xl lg:text-6xl dark:text-white">
            Give me a topic — I&apos;ll turn it into flashcards and quizzes you can actually study.
          </h1>
          <p className="max-w-2xl text-lg text-slate-700 dark:text-slate-100">
            Choose how many cards you want and how tough they should be. StudyPilot builds a focused set in seconds so
            you can memorize faster and stress less.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-brand to-indigo-500 text-white shadow-lg hover:from-brand/90 hover:to-indigo-500/90"
              >
                Generate my study set
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/#how-it-works" className="text-sm font-semibold text-slate-600 underline dark:text-slate-200">
              See how it works
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-100/80">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-3 py-1 text-slate-700 ring-1 ring-slate-200/70 dark:bg-white/10 dark:text-slate-100 dark:ring-white/20">
              <ShieldCheck className="h-4 w-4" /> Secure processing via Firebase + Supabase
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-3 py-1 text-slate-700 ring-1 ring-slate-200/70 dark:bg-white/10 dark:text-slate-100 dark:ring-white/20">
              <Zap className="h-4 w-4" /> Cards and quizzes in seconds
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-3 py-1 text-slate-700 ring-1 ring-slate-200/70 dark:bg-white/10 dark:text-slate-100 dark:ring-white/20">
              <Gauge className="h-4 w-4" /> You set card count + difficulty
            </span>
          </div>
          <div className="grid gap-3 rounded-xl border border-slate-200/80 bg-white/70 p-4 text-left shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/70">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">You stay in control</p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <span className="rounded-lg bg-slate-900/5 px-3 py-2 ring-1 ring-slate-200/60 dark:bg-white/10 dark:ring-white/10">
                12 cards in this set
              </span>
              <span className="rounded-lg bg-slate-900/5 px-3 py-2 ring-1 ring-slate-200/60 dark:bg-white/10 dark:ring-white/10">
                Difficulty: steady
              </span>
              <span className="rounded-lg bg-slate-900/5 px-3 py-2 ring-1 ring-slate-200/60 dark:bg-white/10 dark:ring-white/10">
                Flashcards + quiz ready to study
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <Card className="card-glow bg-white/90 text-slate-900 shadow-xl backdrop-blur dark:bg-slate-900/80 dark:text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Study set snapshot</CardTitle>
              <CardDescription>What you&apos;ll see after entering a topic.</CardDescription>
            </CardHeader>
            <div className="grid gap-3">
              <div className="rounded-xl border border-slate-200/80 bg-white p-5 text-left text-slate-900 shadow-lg dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 dark:text-white">
                <p className="text-sm uppercase text-slate-500 dark:text-slate-400">Flashcard</p>
                <p className="text-xl font-semibold">Why does cellular respiration matter for exams?</p>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                  It powers every cell. StudyPilot writes the key equation, what it fuels, and a concrete example you can
                  recall under pressure.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 text-left shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
                <p className="text-sm uppercase text-slate-500">Quiz check</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  Which statement shows you truly understand cellular respiration?
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-100">
                  <li className="rounded-md bg-slate-50 px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-slate-800">
                    A. It is only used by plants.
                  </li>
                  <li className="rounded-md bg-slate-50 px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-slate-800">
                    B. It releases energy by breaking down glucose so cells can work.
                  </li>
                  <li className="rounded-md bg-slate-50 px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-slate-800">
                    C. It happens randomly without enzymes.
                  </li>
                </ul>
                <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">Answer: B</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="demo" className="relative z-10 mx-auto max-w-6xl px-4 pb-16">
        <InteractiveDemo />
      </section>

      <section
        id="how-it-works"
        className="relative z-10 mx-auto max-w-6xl space-y-8 rounded-3xl border border-slate-200 bg-white/90 px-4 py-12 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70"
      >
        <div className="space-y-3 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 ring-1 ring-slate-200/60 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10">
            How it works
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Low-effort path to real studying</h2>
          <p className="text-slate-600 dark:text-slate-200">
            No jargon, no hoops. Just pick a topic, set your card count and difficulty, and start practicing.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <Sparkles className="h-5 w-5" />,
              title: "Give me a topic",
              desc: "Type a subject or paste your notes. We find the exam-ready points automatically."
            },
            {
              icon: <Gauge className="h-5 w-5" />,
              title: "Choose card count + difficulty",
              desc: "Set how many cards you want and whether you want a gentle warm-up or a tougher drill."
            },
            {
              icon: <NotebookPen className="h-5 w-5" />,
              title: "Study tools that stick",
              desc: "Get flashcards and quiz checks you can flip through instantly—no extra formatting needed."
            }
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-5 text-left text-slate-900 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/15">
                {item.icon}
              </div>
              <p className="text-lg font-semibold">{item.title}</p>
              <p className="text-sm text-slate-700 dark:text-white/80">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-12 max-w-6xl space-y-6 px-4 pb-12">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              <Target className="h-4 w-4" /> Built for students
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Flashcards you can memorize. Quizzes that test what matters.
            </h3>
            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                Study-ready wording—definitions, whys, and examples instead of AI fluff.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                Control difficulty and length so each set fits tonight&apos;s study window.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                Quizzes pair with your flashcards to check recall—not just recognition.
              </li>
            </ul>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4" /> Trust & privacy
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Trusted by students, built to be safe.</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm dark:border-slate-800/60 dark:bg-slate-800/60 dark:text-slate-100">
                <Users className="mb-2 h-5 w-5 text-indigo-500 dark:text-indigo-200" />
                12,000+ study sets generated with StudyPilot.
              </div>
              <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm dark:border-slate-800/60 dark:bg-slate-800/60 dark:text-slate-100">
                <Lock className="mb-2 h-5 w-5 text-indigo-500 dark:text-indigo-200" />
                Your notes stay private—securely processed via Firebase + Supabase, never sold.
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Want receipts? We&apos;re happy to share our security controls and delete your data on request.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-6xl space-y-8 px-4 pb-16">
        <div className="space-y-3 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 ring-1 ring-slate-200/60 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10">
            Pricing
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Simple, student-first plans</h2>
          <p className="text-slate-600 dark:text-slate-200">Start free. Upgrade only when you need more cards.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              name: "Free forever",
              price: "$0",
              tagline: "Great for weekly quizzes or a quick cram session.",
              features: ["Up to 20 cards per set", "3 study sets per day", "Flashcards + quizzes included"]
            },
            {
              name: "Pro",
              price: "$9/mo",
              tagline: "For finals, AP prep, and heavier study blocks.",
              features: ["Larger sets and priority generations", "Unlimited study sets", "Library + analytics to track progress"]
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
