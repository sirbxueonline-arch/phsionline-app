"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="bg-background text-text-primary">
      <section className="mx-auto flex min-h-[calc(100vh-120px)] max-w-[640px] flex-col items-center justify-center px-6 py-20 text-center">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-panel/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            Exam-focused prep
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Turn any topic into exam-ready practice.
          </h1>
          <p className="text-lg text-text-muted">
            Focused flashcards and quizzes. No fluff. No distractions.
          </p>
        </div>

        <div className="mt-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-accent text-[var(--text-on-accent)] hover:bg-accent-strong"
            onClick={() => router.push("/auth/signup")}
          >
            Start free
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => router.push("/auth/signin")}
          >
            Log in
          </Button>
        </div>

        <p className="mt-8 text-sm text-text-muted">
          Built for exam focus. Calm interface, responsive on every device.
        </p>
      </section>
    </main>
  );
}
