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
  Gauge,
  ListChecks,
  PlayCircle,
  ShieldCheck,
  Target,
  TrendingUp
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

export default function LandingPage() {
  const router = useRouter();

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [subject, setSubject] = useState("");
  const [mode, setMode] = useState<(typeof PRACTICE_MODES)[number]>("Timed drills");
  const [length, setLength] = useState<number>(25);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [accuracyProgress, setAccuracyProgress] = useState(0);
  const [retentionProgress, setRetentionProgress] = useState(0);

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

  const handleStart = () => router.push("/auth/signup");
  const handlePreview = () => router.push("/onboarding");

  return (
    <main className="relative isolate overflow-hidden bg-[#0F172A] text-[#E5E7EB]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(79,70,229,0.18),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(124,58,237,0.16),transparent_32%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.95),rgba(15,23,42,0.94))]" />
      </div>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-28">
        <div className="grid items-start gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0F172A] bg-[#111827] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">
              <span className="h-2 w-2 rounded-full bg-[#4F46E5]" aria-hidden />
              Exam-day discipline
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Deliberate practice for serious exams
              </h1>
              <p className="max-w-2xl text-base text-[#9CA3AF]">
                StudyPilot keeps you focused on pace, accuracy, and retention. Every session feels like the exam: no
                noise, no gimmicks.
              </p>
            </div>

            <div className="space-y-5 rounded-2xl border border-[#0F172A] bg-[#111827] p-6 shadow-2xl shadow-[#0F172A]">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Subject or exam</p>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={ROTATING_SUBJECTS[placeholderIndex]}
                  className="h-12 text-base placeholder:text-[#9CA3AF]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Practice mode</p>
                  <div className="flex flex-wrap gap-2">
                    {PRACTICE_MODES.map((option) => (
                      <Button
                        key={option}
                        variant={mode === option ? "default" : "secondary"}
                        className={`flex-1 min-w-[120px] text-sm ${
                          mode === option ? "shadow-md shadow-[#0F172A]" : "border-[#111827] hover:border-[#4F46E5]"
                        }`}
                        onClick={() => setMode(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Set length</p>
                  <div className="flex flex-wrap gap-2">
                    {SET_LENGTHS.map((count) => (
                      <Button
                        key={count}
                        variant={length === count ? "default" : "secondary"}
                        className={`flex-1 min-w-[90px] text-sm ${
                          length === count ? "shadow-md shadow-[#0F172A]" : "border-[#111827] hover:border-[#4F46E5]"
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
                  className="flex w-full items-center justify-between bg-[#4F46E5] text-base text-[#E5E7EB] hover:bg-[#7C3AED]"
                  onClick={handleStart}
                >
                  Start focused session
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex w-full items-center justify-between border border-[#111827] text-base hover:border-[#4F46E5]"
                  onClick={handlePreview}
                >
                  Preview question style
                  <PlayCircle className="h-5 w-5 text-[#9CA3AF]" />
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-[#0F172A] bg-[#0F172A] p-4">
                  <div className="flex items-center justify-between text-sm text-[#9CA3AF]">
                    <span>Accuracy</span>
                    <TrendingUp className="h-4 w-4 text-[#22C55E]" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-[#E5E7EB]">78%</p>
                  <p className="text-xs text-[#9CA3AF]">+6% vs last week</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#111827]">
                    <div
                      className="h-full rounded-full bg-[#4F46E5] transition-[width] duration-700 ease-out"
                      style={{ width: `${accuracyProgress}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-[#0F172A] bg-[#0F172A] p-4">
                  <div className="flex items-center justify-between text-sm text-[#9CA3AF]">
                    <span>Timing</span>
                    <Clock3 className="h-4 w-4 text-[#F59E0B]" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-[#E5E7EB]">0:48</p>
                  <p className="text-xs text-[#9CA3AF]">Target 0:45</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#111827]">
                    <div
                      className="h-full rounded-full bg-[#4F46E5] transition-[width] duration-700 ease-out"
                      style={{ width: "82%" }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-[#0F172A] bg-[#0F172A] p-4">
                  <div className="flex items-center justify-between text-sm text-[#9CA3AF]">
                    <span>Retention</span>
                    <ShieldCheck className="h-4 w-4 text-[#22C55E]" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-[#E5E7EB]">64%</p>
                  <p className="text-xs text-[#9CA3AF]">Stabilizing</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#111827]">
                    <div
                      className="h-full rounded-full bg-[#4F46E5] transition-[width] duration-700 ease-out"
                      style={{ width: `${retentionProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-[#111827] bg-[#111827] p-6 shadow-2xl shadow-[#0F172A]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">Session preview</p>
                <p className="text-lg font-semibold text-[#E5E7EB]">Neurophysiology drill</p>
                <p className="text-sm text-[#9CA3AF]">Exam-style stems with immediate feedback.</p>
              </div>
              <div className="rounded-full border border-[#4F46E5] bg-[#0F172A] px-3 py-1 text-xs font-semibold text-[#E5E7EB]">
                Focused
              </div>
            </div>

            <div className="rounded-xl border border-[#0F172A] bg-[#0F172A] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Question stem</p>
              <p className="mt-2 text-base font-semibold text-[#E5E7EB]">
                A patient presents with slowed reflexes after chronic opioid use. Which receptor activity most directly
                mediates the observed respiratory depression?
              </p>
              <div className="mt-3 space-y-2 text-sm text-[#E5E7EB]">
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
                        ? "border-[#22C55E] bg-[#111827]"
                        : option.tone === "error"
                          ? "border-[#EF4444] bg-[#111827]"
                          : "border-[#111827] bg-[#111827]"
                    }`}
                  >
                    <span className="mt-0.5 text-xs text-[#9CA3AF]">{option.label}</span>
                    <span>{option.text}</span>
                    {option.tone === "success" && <Check className="ml-auto h-4 w-4 text-[#22C55E]" />}
                    {option.tone === "error" && <AlertTriangle className="ml-auto h-4 w-4 text-[#EF4444]" />}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-[#22C55E]">Marked correct; move to spaced review</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#0F172A] bg-[#0F172A] p-3">
                <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                  <span>Session progress</span>
                  <span>72%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#111827]">
                  <div
                    className="h-full rounded-full bg-[#4F46E5] transition-[width] duration-700 ease-out"
                    style={{ width: `${sessionProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-[#9CA3AF]">Sections collapse as you clear them.</p>
              </div>
              <div className="rounded-xl border border-[#0F172A] bg-[#0F172A] p-3">
                <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                  <span>Pace</span>
                  <span>0:48 / q</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#111827]">
                  <div className="h-full rounded-full bg-[#4F46E5] transition-[width] duration-700 ease-out" style={{ width: "82%" }} />
                </div>
                <p className="mt-2 text-sm text-[#F59E0B]">Slightly over target; tighten transitions.</p>
              </div>
            </div>

            <div className="rounded-xl border border-[#0F172A] bg-[#0F172A] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Recovery queue</p>
                <ListChecks className="h-4 w-4 text-[#E5E7EB]" />
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Neurotransmitter kinetics", status: "stable", note: "Ready to graduate" },
                  { label: "Membrane potential math", status: "warning", note: "Timing drifts after 30s" },
                  { label: "Pharmacology cross-reactions", status: "error", note: "Missed twice" }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-[#111827] bg-[#111827] px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#E5E7EB]">{item.label}</p>
                      <p className="text-xs text-[#9CA3AF]">{item.note}</p>
                    </div>
                    {item.status === "stable" && (
                      <span className="rounded-full border border-[#22C55E] px-2 py-1 text-[11px] font-semibold text-[#22C55E]">
                        Solid
                      </span>
                    )}
                    {item.status === "warning" && (
                      <span className="rounded-full border border-[#F59E0B] px-2 py-1 text-[11px] font-semibold text-[#F59E0B]">
                        Review
                      </span>
                    )}
                    {item.status === "error" && (
                      <span className="rounded-full border border-[#EF4444] px-2 py-1 text-[11px] font-semibold text-[#EF4444]">
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

      <section id="how-it-works" className="relative mx-auto max-w-6xl px-6 pb-14">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">Practice pipeline</p>
          <h2 className="text-3xl font-semibold">A calm, exam-grade workflow</h2>
          <p className="text-base text-[#9CA3AF]">
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
            <Card key={item.title} className="border-[#111827] bg-[#111827] shadow-lg shadow-[#0F172A]">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#4F46E5] bg-[#0F172A]">
                  <item.icon className="h-5 w-5 text-[#E5E7EB]" />
                </div>
                <CardTitle className="text-xl text-[#E5E7EB]">{item.title}</CardTitle>
              </CardHeader>
              <CardDescription className="text-[#9CA3AF]">{item.body}</CardDescription>
              <p className="mt-4 text-sm text-[#E5E7EB]">{item.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4 rounded-2xl border border-[#0F172A] bg-[#111827] p-6 shadow-2xl shadow-[#0F172A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">Progress board</p>
                <h3 className="text-2xl font-semibold text-[#E5E7EB]">Clarity on what to fix next</h3>
              </div>
              <Gauge className="h-6 w-6 text-[#E5E7EB]" />
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
                <div key={metric.label} className="rounded-xl border border-[#0F172A] bg-[#0F172A] p-4">
                  <div className="flex items-center justify-between text-sm text-[#9CA3AF]">
                    <span>{metric.label}</span>
                    <span className="text-xs" style={{ color: metric.color }}>
                      {metric.change}
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-[#E5E7EB]">{metric.value}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#111827]">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{ width: `${metric.width}%`, backgroundColor: metric.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[#0F172A] bg-[#0F172A] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#E5E7EB]">Streaks that matter</p>
                  <p className="text-xs text-[#9CA3AF]">Consistency rewards accuracy and pace; no streak games.</p>
                </div>
                <div className="rounded-full border border-[#4F46E5] px-2 py-1 text-[11px] font-semibold text-[#E5E7EB]">
                  Weekly view
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {[
                  { label: "On-time closes", value: "14", note: "last 7 sessions" },
                  { label: "Flagged for review", value: "5", note: "scheduled tonight" },
                  { label: "Stabilized topics", value: "9", note: "holding at 85%+" }
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-[#111827] bg-[#111827] p-3">
                    <p className="text-sm text-[#9CA3AF]">{item.label}</p>
                    <p className="text-xl font-semibold text-[#E5E7EB]">{item.value}</p>
                    <p className="text-xs text-[#9CA3AF]">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-[#0F172A] bg-[#111827] p-6 shadow-2xl shadow-[#0F172A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">After-session cadence</p>
                <h3 className="text-xl font-semibold text-[#E5E7EB]">Keep moving forward</h3>
              </div>
              <BookOpenCheck className="h-5 w-5 text-[#E5E7EB]" />
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
                <div key={item.title} className="flex items-start gap-3 rounded-xl border border-[#111827] bg-[#0F172A] p-4">
                  <div
                    className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border ${
                      item.status === "success"
                        ? "border-[#22C55E] text-[#22C55E]"
                        : item.status === "warning"
                          ? "border-[#F59E0B] text-[#F59E0B]"
                          : "border-[#EF4444] text-[#EF4444]"
                    }`}
                  >
                    {item.status === "success" && <Check className="h-4 w-4" />}
                    {item.status === "warning" && <Clock3 className="h-4 w-4" />}
                    {item.status === "error" && <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#E5E7EB]">{item.title}</p>
                    <p className="text-sm text-[#9CA3AF]">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[#0F172A] bg-[#0F172A] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#E5E7EB]">Schedule preview</p>
                  <p className="text-xs text-[#9CA3AF]">Short, focused blocks across the week.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#E5E7EB]" />
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { title: "Tonight - 18 min", detail: "Review flagged timing issues", tone: "warning" },
                  { title: "Tomorrow - 25 min", detail: "New set + stability check", tone: "success" },
                  { title: "Weekend - 40 min", detail: "Full-length simulation", tone: "success" }
                ].map((slot) => (
                  <div
                    key={slot.title}
                    className="flex items-center justify-between rounded-lg border border-[#111827] bg-[#111827] px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#E5E7EB]">{slot.title}</p>
                      <p className="text-xs text-[#9CA3AF]">{slot.detail}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                        slot.tone === "warning"
                          ? "border border-[#F59E0B] text-[#F59E0B]"
                          : "border border-[#4F46E5] text-[#E5E7EB]"
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
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#0F172A] bg-[#111827] p-6 shadow-2xl shadow-[#0F172A] md:flex-row md:items-center">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">Ready to train</p>
            <h3 className="text-2xl font-semibold text-[#E5E7EB]">Build exam confidence without the noise</h3>
            <p className="text-sm text-[#9CA3AF]">Start a disciplined session now and see progress in minutes.</p>
          </div>
          <div className="flex gap-3">
            <Button
              size="lg"
              className="bg-[#4F46E5] text-[#E5E7EB] hover:bg-[#7C3AED]"
              onClick={handleStart}
            >
              Start a session
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="border border-[#4F46E5] text-[#E5E7EB] hover:bg-[#111827]"
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
