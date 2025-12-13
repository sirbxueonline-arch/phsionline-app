import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Gauge, NotebookPen, Rocket } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 light-gradient-bg blur-3xl opacity-80 dark:gradient-bg" />
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/70 via-white/40 to-transparent dark:from-slate-900/70 dark:via-slate-900/30" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center gap-12 px-4 pb-20 pt-28 text-center lg:flex-row lg:text-left">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/60 dark:bg-white/10 dark:text-slate-200 dark:ring-white/20">
            <Sparkles className="h-4 w-4" /> AI-first study companion
          </div>
          <h1 className="font-display text-4xl leading-tight text-slate-900 md:text-5xl lg:text-6xl dark:text-white">
            AI-Powered Study Companion
          </h1>
          <p className="max-w-2xl text-lg text-slate-700 dark:text-slate-100">
            Generate crisp explanations, interactive flashcards, quizzes, and study plans in seconds.
            StudyPilot keeps you focused with modern design and analytics.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href="/auth/signup">
              <Button size="lg" className="shadow-glow bg-white text-slate-900 hover:bg-slate-200">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="text-white border-white/40 hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-100/80">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
              <ShieldCheck className="h-4 w-4" /> Secure sync via Firebase + Supabase
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
              <Zap className="h-4 w-4" /> Generations in seconds
            </span>
          </div>
        </div>
        <div className="flex-1">
          <Card className="card-glow bg-white/90 text-slate-900 shadow-xl backdrop-blur dark:bg-slate-900/80 dark:text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Preview: Flashcard</CardTitle>
              <CardDescription>Glance at how StudyPilot structures your study set.</CardDescription>
            </CardHeader>
            <div className="grid gap-3">
              <div className="rounded-xl border border-slate-200/80 bg-white p-5 text-left text-slate-900 shadow-lg dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 dark:text-white">
                <p className="text-sm uppercase text-slate-500 dark:text-slate-400">Question</p>
                <p className="text-xl font-semibold">What is photosynthesis?</p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 text-left shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
                <p className="text-sm uppercase text-slate-500">Answer</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  The process by which plants convert light energy into chemical energy, producing glucose
                  and oxygen from carbon dioxide and water.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60 md:grid-cols-3">
          {[
            {
              icon: <Gauge className="h-5 w-5" />,
              title: "Fast starts",
              desc: "Pick a template for flashcards, quizzes, explanations, or plans."
            },
            {
              icon: <NotebookPen className="h-5 w-5" />,
              title: "Structured output",
              desc: "Clean JSON for every generation, easy to review and save."
            },
            {
              icon: <Rocket className="h-5 w-5" />,
              title: "Study-ready",
              desc: "Flip cards, take quizzes, and track usage with built-in analytics."
            }
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-4 text-left text-slate-900 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white"
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
    </main>
  );
}
