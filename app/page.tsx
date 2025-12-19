"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="relative z-0 overflow-hidden text-text-primary">
      <div className="hero-glow" aria-hidden="true" />

      <section className="relative mx-auto flex min-h-[100svh] max-w-[640px] flex-col items-center justify-center px-6 py-24 text-center">
        <div className="space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-text-muted">
            Exam-focused prep
          </p>
          <h1 className="text-5xl font-bold leading-[1.18] tracking-tight sm:text-6xl">
            Turn any topic into <span className="font-extrabold">exam-ready practice.</span>
          </h1>
          <p className="text-lg leading-relaxed text-text-muted">
            Focused flashcards and quizzes—no fluff. Built to improve accuracy and exam-day recall.
          </p>
        </div>

        <div className="mt-12 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-accent text-[var(--text-on-accent)] shadow-sm hover:bg-accent-strong"
            onClick={() => router.push("/auth/signup")}
          >
            Start free
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="w-full px-4 py-2 text-sm sm:w-auto"
            onClick={() => router.push("/auth/signin")}
          >
            Log in
          </Button>
        </div>

        <p className="mt-4 text-sm text-text-muted">
          Designed for focused exam preparation—built for results, not streaks.
        </p>
      </section>
    </main>
  );
}
