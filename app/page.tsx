"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  Check,
  Clock3,
  CreditCard,
  Gauge,
  ListChecks,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const ROTATING_SUBJECTS = [
  "USMLE Step 1 - Neuro",
  "CFA Level I - Ethics",
  "AP Chemistry - Kinetics",
  "LSAT - Logical Reasoning",
  "SAT Math - Functions"
];

const PRACTICE_MODES = ["Timed drills", "Precision recall", "Mixed review"] as const;
const SET_LENGTHS = [15, 25, 40];

type LandingStats = {
  users: number | null;
  studySets: number | null;
  successStories: number | null;
  updatedAt: string;
};

export default function LandingPage() {
  const router = useRouter();

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [subject, setSubject] = useState("");
  const [mode, setMode] = useState<(typeof PRACTICE_MODES)[number]>("Timed drills");
  const [length, setLength] = useState<number>(25);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [accuracyProgress, setAccuracyProgress] = useState(0);
  const [retentionProgress, setRetentionProgress] = useState(0);
  const [landingStats, setLandingStats] = useState<LandingStats | null>(null);

  useEffect(() => {
    const id = setInterval(
      () => setPlaceholderIndex((prev) => (prev + 1) % ROTATING_SUBJECTS.length),
      3200
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSessionProgress(72);
      setAccuracyProgress(78);
      setRetentionProgress(64);
    }, 160);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadLandingStats = async () => {
      try {
        const res = await fetch("/api/landing-stats");
        if (!res.ok) return;
        const json = (await res.json()) as Partial<LandingStats>;
        if (cancelled) return;
        setLandingStats({
          users: typeof json.users === "number" ? json.users : null,
          studySets: typeof json.studySets === "number" ? json.studySets : null,
          successStories: typeof json.successStories === "number" ? json.successStories : null,
          updatedAt: typeof json.updatedAt === "string" ? json.updatedAt : new Date().toISOString()
        });
      } catch (err) {
        // ignore; stats are optional
      }
    };

    loadLandingStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStart = () => router.push("/auth/signup");
  const handlePreview = () => router.push("/onboarding");

  const formatCompact = (value: number) =>
    new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value);

  const learnersDisplay =
    typeof landingStats?.users === "number" ? formatCompact(landingStats.users) : "Early access";
  const setsDisplay =
    typeof landingStats?.studySets === "number" ? formatCompact(landingStats.studySets) : "—";
  const winsDisplay =
    typeof landingStats?.successStories === "number" ? formatCompact(landingStats.successStories) : "Share yours";

  return (
    <main className="relative isolate overflow-hidden bg-[var(--bg)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 theme-gradient" />

      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-28">
        <div className="grid items-start gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden />
              Exam-day discipline
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Deliberate practice for serious exams
              </h1>
              <p className="max-w-2xl text-base text-[var(--text-muted)]">
                StudyPilot turns your topic (or notes) into exam-grade drills with pacing, accuracy, and retention
                feedback. Less busywork, more performance.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Who it&apos;s for
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: Target,
                    title: "High-stakes exam takers",
                    body: "USMLE, LSAT, CFA, SAT, AP, certifications"
                  },
                  {
                    icon: Clock3,
                    title: "Anyone training timing",
                    body: "Pace targets and time pressure built in"
                  },
                  {
                    icon: ShieldCheck,
                    title: "People who forget later",
                    body: "Misses recycle into spaced stabilization"
                  },
                  {
                    icon: Sparkles,
                    title: "Students with messy notes",
                    body: "Generate drills fast, then refine weak spots"
                  }
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--panel)]">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-[var(--text-muted)]">
                Quizlet and Anki are great for memorization. StudyPilot is built for{" "}
                <span className="text-[var(--text-primary)]">performing under time pressure</span>.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Learners",
                  value: learnersDisplay,
                  note: "Accounts created",
                  icon: Users
                },
                {
                  label: "Study sets",
                  value: setsDisplay,
                  note: "Saved in StudyPilot",
                  icon: BookOpenCheck
                },
                {
                  label: "Exam wins",
                  value: winsDisplay,
                  note: "Success stories shared",
                  icon: TrendingUp
                }
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="font-semibold uppercase tracking-[0.18em]">{item.label}</span>
                    <item.icon className="h-4 w-4" aria-hidden />
                  </div>
                  <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.note}</p>
                </div>
              ))}
            </div>

            <div className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 theme-shadow-strong">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Subject or exam</p>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={ROTATING_SUBJECTS[placeholderIndex]}
                  className="h-12 text-base placeholder:text-[var(--text-muted)]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Practice mode</p>
                  <div className="flex flex-wrap gap-2">
                    {PRACTICE_MODES.map((option) => (
                      <Button
                        key={option}
                        variant={mode === option ? "default" : "secondary"}
                        className={`flex-1 min-w-[120px] text-sm ${
                          mode === option ? "shadow-md" : "border-[var(--border)] hover:border-[var(--accent)]"
                        }`}
                        onClick={() => setMode(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Set length</p>
                  <div className="flex flex-wrap gap-2">
                    {SET_LENGTHS.map((count) => (
                      <Button
                        key={count}
                        variant={length === count ? "default" : "secondary"}
                        className={`flex-1 min-w-[90px] text-sm ${
                          length === count ? "shadow-md" : "border-[var(--border)] hover:border-[var(--accent)]"
                        }`}
                        onClick={() => setLength(count)}
                      >
                        {count} questions
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Button
                  size="lg"
                  className="flex w-full items-center justify-between text-base"
                  onClick={handleStart}
                >
                  Start focused session
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex w-full items-center justify-between border border-[var(--border)] text-base hover:border-[var(--accent)]"
                  onClick={handlePreview}
                >
                  Preview question style
                  <PlayCircle className="h-5 w-5 text-[var(--text-muted)]" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5" />
                  Free plan available — no card needed to start.
                </span>
                <a href="#pricing" className="underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--text-primary)]">
                  See pricing
                </a>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
                  <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                    <span>Accuracy</span>
                    <TrendingUp className="h-4 w-4 text-[var(--success)]" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold">78%</p>
                  <p className="text-xs text-[var(--text-muted)]">+6% vs last week</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-700 ease-out"
                      style={{ width: `${accuracyProgress}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
                  <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                    <span>Timing</span>
                    <Clock3 className="h-4 w-4 text-[var(--warning)]" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold">0:48</p>
                  <p className="text-xs text-[var(--text-muted)]">Target 0:45</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-700 ease-out"
                      style={{ width: "82%" }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
                  <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                    <span>Retention</span>
                    <ShieldCheck className="h-4 w-4 text-[var(--success)]" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold">64%</p>
                  <p className="text-xs text-[var(--text-muted)]">Stabilizing</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-700 ease-out"
                      style={{ width: `${retentionProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 theme-shadow-strong">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Session preview</p>
                <p className="text-lg font-semibold">Neurophysiology drill</p>
                <p className="text-sm text-[var(--text-muted)]">Exam-style stems with immediate feedback.</p>
              </div>
              <div className="rounded-full border border-[var(--accent)] bg-[var(--panel)] px-3 py-1 text-xs font-semibold">
                Focused
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Question stem</p>
              <p className="mt-2 text-base font-semibold">
                A patient presents with slowed reflexes after chronic opioid use. Which receptor activity most directly
                mediates the observed respiratory depression?
              </p>
              <div className="mt-3 space-y-2 text-sm">
                {[
                  { label: "A", text: "NMDA receptor blockade", tone: "neutral" },
                  { label: "B", text: "Mu receptor hyperpolarization", tone: "success" },
                  { label: "C", text: "Kappa receptor antagonism", tone: "neutral" },
                  { label: "D", text: "Delta receptor sensitization", tone: "error" }
                ].map((option) => (
                  <div
                    key={option.label}
                    className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${
                      option.tone === "success"
                        ? "border-[var(--success)] bg-[var(--surface)]"
                        : option.tone === "error"
                          ? "border-[var(--error)] bg-[var(--surface)]"
                          : "border-[var(--border)] bg-[var(--surface)]"
                    }`}
                  >
                    <span className="mt-0.5 text-xs text-[var(--text-muted)]">{option.label}</span>
                    <span>{option.text}</span>
                    {option.tone === "success" && <Check className="ml-auto h-4 w-4 text-[var(--success)]" />}
                    {option.tone === "error" && <AlertTriangle className="ml-auto h-4 w-4 text-[var(--error)]" />}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-[var(--success)]">Marked correct; move to spaced review</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>Session progress</span>
                  <span>72%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-700 ease-out"
                    style={{ width: `${sessionProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-[var(--text-muted)]">Sections collapse as you clear them.</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>Pace</span>
                  <span>0:48 / q</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                  <div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-700 ease-out" style={{ width: "82%" }} />
                </div>
                <p className="mt-2 text-sm text-[var(--warning)]">Slightly over target; tighten transitions.</p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Recovery queue</p>
                <ListChecks className="h-4 w-4" />
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Neurotransmitter kinetics", status: "stable", note: "Ready to graduate" },
                  { label: "Membrane potential math", status: "warning", note: "Timing drifts after 30s" },
                  { label: "Pharmacology cross-reactions", status: "error", note: "Missed twice" }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-[var(--text-muted)]">{item.note}</p>
                    </div>
                    {item.status === "stable" && (
                      <span className="rounded-full border border-[var(--success)] px-2 py-1 text-[11px] font-semibold text-[var(--success)]">
                        Solid
                      </span>
                    )}
                    {item.status === "warning" && (
                      <span className="rounded-full border border-[var(--warning)] px-2 py-1 text-[11px] font-semibold text-[var(--warning)]">
                        Review
                      </span>
                    )}
                    {item.status === "error" && (
                      <span className="rounded-full border border-[var(--error)] px-2 py-1 text-[11px] font-semibold text-[var(--error)]">
                        Re-drill
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative mx-auto max-w-6xl scroll-mt-28 px-6 pb-14">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Practice pipeline</p>
          <h2 className="text-3xl font-semibold">A calm, exam-grade workflow</h2>
          <p className="text-base text-[var(--text-muted)]">
            Structure every session: plan the attempt, run disciplined drills, then lock in what actually matters.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Plan",
              icon: Target,
              body: "Define scope, pacing, and depth before you start. Visibility beats volume.",
              detail: "Blueprint ready in under 30 seconds."
            },
            {
              title: "Drill",
              icon: Activity,
              body: "Exam-weighted stems with immediate correction. Sections close as you clear them.",
              detail: "Progress animates only when you earn it."
            },
            {
              title: "Stabilize",
              icon: ShieldCheck,
              body: "Missed items recycle with timing pressure so recall stays sharp.",
              detail: "Retention tracked across sessions."
            }
          ].map((item) => (
            <Card key={item.title} className="border-[var(--border)] bg-[var(--surface)] theme-shadow-soft">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--panel)]">
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardDescription className="text-[var(--text-muted)]">{item.body}</CardDescription>
              <p className="mt-4 text-sm">{item.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Why it works</p>
          <h2 className="text-3xl font-semibold">Built for outcomes, not collections</h2>
          <p className="max-w-3xl text-base text-[var(--text-muted)]">
            StudyPilot complements your bank and flashcards: generate targeted sets, drill them under realistic timing,
            then recycle weak spots until they stick.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "StudyPilot",
              top: "Exam-mode drills + analytics",
              bottom: "Pace, accuracy, and retention in one loop.",
              highlight: true
            },
            {
              title: "Quizlet",
              top: "Fast definitions & term recall",
              bottom: "Less support for timing + exam pressure.",
              highlight: false
            },
            {
              title: "Anki",
              top: "Powerful spaced repetition",
              bottom: "More setup; not built around exam pacing.",
              highlight: false
            },
            {
              title: "Official banks",
              top: "Authentic question exposure",
              bottom: "Still need structure to fix weak areas.",
              highlight: false
            }
          ].map((item) => (
            <Card
              key={item.title}
              className={`bg-[var(--surface)] ${item.highlight ? "border-[var(--accent)]" : "border-[var(--border)]"}`}
            >
              <CardHeader className="mb-0 flex flex-col gap-1">
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription className="text-[var(--text-muted)]">{item.top}</CardDescription>
              </CardHeader>
              <p className="mt-4 text-sm">{item.bottom}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="relative mx-auto max-w-6xl scroll-mt-28 px-6 pb-16">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Pricing</p>
          <h2 className="text-3xl font-semibold">Simple tiers, clear upgrades</h2>
          <p className="max-w-3xl text-base text-[var(--text-muted)]">
            Start with the free plan. Upgrade for higher limits and priority AI models when you&apos;re ramping up.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-xl">Free</CardTitle>
                <CardDescription>For getting the workflow dialed in.</CardDescription>
              </div>
              <span className="rounded-full border border-[var(--success)] px-2 py-1 text-[11px] font-semibold text-[var(--success)]">
                No card
              </span>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-semibold">$0</p>
              <p className="text-sm text-[var(--text-muted)]">per month</p>
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              {[
                "20 saves per month",
                "Flashcards, quizzes, plans",
                "Basic analytics and review loop"
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[var(--text-muted)]">
                  <Check className="mt-0.5 h-4 w-4 text-[var(--success)]" />
                  <span className="text-[var(--text-primary)]">{feature}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" className="mt-6 w-full" onClick={handleStart}>
              Start free
            </Button>
          </Card>

          <Card className="border-[var(--accent)] bg-[var(--surface)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-xl">Pro</CardTitle>
                <CardDescription>For heavier volume and faster iterations.</CardDescription>
              </div>
              <span className="rounded-full border border-[var(--accent)] bg-[var(--panel)] px-2 py-1 text-[11px] font-semibold">
                Recommended
              </span>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <p className="text-4xl font-semibold">$12</p>
              <p className="pb-1 text-sm text-[var(--text-muted)]">/ mo</p>
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              {[
                "Higher monthly limits (unlimited coming soon)",
                "Priority Gemini/OpenAI models",
                "Advanced analytics and export"
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[var(--text-muted)]">
                  <Check className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                  <span className="text-[var(--text-primary)]">{feature}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" className="mt-6 w-full" onClick={handleStart}>
              Start free, then upgrade
            </Button>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              Secure checkout via Stripe. Monthly billing — cancel anytime.
            </p>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-xl">Team</CardTitle>
                <CardDescription>For shared decks and centralized billing.</CardDescription>
              </div>
              <span className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-2 py-1 text-[11px] font-semibold text-[var(--text-muted)]">
                Coming soon
              </span>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-semibold">Talk to us</p>
              <p className="text-sm text-[var(--text-muted)]">seat-based pricing</p>
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              {["Shared workspaces", "Centralized billing & controls", "Onboarding + support"].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[var(--text-muted)]">
                  <Check className="mt-0.5 h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-primary)]">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="secondary"
              size="lg"
              className="mt-6 w-full border border-[var(--border)]"
              onClick={handleStart}
            >
              Join early access
            </Button>
          </Card>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 md:grid-cols-3">
          {[
            {
              icon: CreditCard,
              title: "No surprises",
              body: "Free plan is $0. Pro is monthly."
            },
            {
              icon: ShieldCheck,
              title: "Secure billing",
              body: "Stripe Checkout for paid plans."
            },
            {
              icon: Gauge,
              title: "Real feedback",
              body: "Track pace, accuracy, and retention."
            }
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--panel)]">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 theme-shadow-strong">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Progress board</p>
                <h3 className="text-2xl font-semibold">Clarity on what to fix next</h3>
              </div>
              <Gauge className="h-6 w-6" />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                {
                  label: "Accuracy",
                  value: "78%",
                  change: "+6% week",
                  color: "#22C55E",
                  width: accuracyProgress
                },
                {
                  label: "Pace control",
                  value: "0:48",
                  change: "Target 0:45",
                  color: "#F59E0B",
                  width: 82
                },
                {
                  label: "Retention",
                  value: "64%",
                  change: "Stabilizing",
                  color: "#4F46E5",
                  width: retentionProgress
                }
              ].map((metric) => (
                <div key={metric.label} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
                  <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                    <span>{metric.label}</span>
                    <span className="text-xs" style={{ color: metric.color }}>
                      {metric.change}
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{ width: `${metric.width}%`, backgroundColor: metric.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">Streaks that matter</p>
                  <p className="text-xs text-[var(--text-muted)]">Consistency rewards accuracy and pace; no streak games.</p>
                </div>
                <div className="rounded-full border border-[var(--accent)] px-2 py-1 text-[11px] font-semibold">
                  Weekly view
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {[
                  { label: "On-time closes", value: "14", note: "last 7 sessions" },
                  { label: "Flagged for review", value: "5", note: "scheduled tonight" },
                  { label: "Stabilized topics", value: "9", note: "holding at 85%+" }
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                    <p className="text-sm text-[var(--text-muted)]">{item.label}</p>
                    <p className="text-xl font-semibold">{item.value}</p>
                    <p className="text-xs text-[var(--text-muted)]">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 theme-shadow-strong">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">After-session cadence</p>
                <h3 className="text-xl font-semibold">Keep moving forward</h3>
              </div>
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "Re-drill misses",
                  body: "Incorrect answers go straight to a short, timed loop.",
                  status: "error"
                },
                {
                  title: "Stability check",
                  body: "Correct answers resurface in a calm spaced schedule.",
                  status: "success"
                },
                {
                  title: "Timing review",
                  body: "Questions over time budget get a pacing reminder badge.",
                  status: "warning"
                }
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
                  <div
                    className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border ${
                      item.status === "success"
                        ? "border-[var(--success)] text-[var(--success)]"
                        : item.status === "warning"
                          ? "border-[var(--warning)] text-[var(--warning)]"
                          : "border-[var(--error)] text-[var(--error)]"
                    }`}
                  >
                    {item.status === "success" && <Check className="h-4 w-4" />}
                    {item.status === "warning" && <Clock3 className="h-4 w-4" />}
                    {item.status === "error" && <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-sm text-[var(--text-muted)]">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Schedule preview</p>
                  <p className="text-xs text-[var(--text-muted)]">Short, focused blocks across the week.</p>
                </div>
                <ArrowRight className="h-4 w-4" />
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { title: "Tonight - 18 min", detail: "Review flagged timing issues", tone: "warning" },
                  { title: "Tomorrow - 25 min", detail: "New set + stability check", tone: "success" },
                  { title: "Weekend - 40 min", detail: "Full-length simulation", tone: "success" }
                ].map((slot) => (
                  <div
                    key={slot.title}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold">{slot.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{slot.detail}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                        slot.tone === "warning"
                          ? "border border-[var(--warning)] text-[var(--warning)]"
                          : "border border-[var(--accent)] text-[var(--text-primary)]"
                      }`}
                    >
                      Ready
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-20">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 theme-shadow-strong md:flex-row md:items-center">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Ready to train</p>
            <h3 className="text-2xl font-semibold">Build exam confidence without the noise</h3>
            <p className="text-sm text-[var(--text-muted)]">Start a disciplined session now and see progress in minutes.</p>
          </div>
          <div className="flex gap-3">
            <Button
              size="lg"
              className="bg-[var(--accent)] hover:bg-[var(--accent-strong)]"
              onClick={handleStart}
            >
              Start a session
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="border border-[var(--accent)] hover:bg-[var(--surface)]"
              onClick={handlePreview}
            >
              See the workspace
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
