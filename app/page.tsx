"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Compass, Rocket, Sparkles, Target, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

const EXAMS = ["SAT", "ACT", "LSAT", "USMLE", "CFA"] as const;

type LandingStats = {
  users: number | null;
  studySets: number | null;
  successStories: number | null;
  updatedAt: string;
};

const formatCompact = (value: number) =>
  new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value);

export default function LandingPage() {
  const router = useRouter();

  const [exam, setExam] = useState<(typeof EXAMS)[number]>("SAT");
  const [landingStats, setLandingStats] = useState<LandingStats | null>(null);

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
      } catch {
        // stats are optional
      }
    };

    loadLandingStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = [
    {
      label: "Learners",
      value:
        typeof landingStats?.users === "number" ? formatCompact(landingStats.users) : "Growing daily",
      note: "Accounts created"
    },
    {
      label: "Study sets",
      value:
        typeof landingStats?.studySets === "number"
          ? formatCompact(landingStats.studySets)
          : "Organized automatically",
      note: "Saved in StudyPilot"
    },
    {
      label: "Exam wins",
      value:
        typeof landingStats?.successStories === "number"
          ? formatCompact(landingStats.successStories)
          : "Documented wins",
      note: "Learners reporting ready"
    }
  ];

  return (
    <main className="relative isolate overflow-hidden bg-[var(--bg)] text-[var(--text-primary)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-[-240px] h-[540px] bg-[radial-gradient(circle_at_20%_24%,rgba(255,138,61,0.18),transparent_36%),radial-gradient(circle_at_78%_14%,rgba(61,213,152,0.14),transparent_32%)] blur-3xl"
        aria-hidden="true"
      />

      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-24 md:pt-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              <Rocket className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
              StudyPilot — calm, focused prep
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Train for exam day with targeted drills.
              </h1>
              <p className="max-w-2xl text-lg text-[var(--text-muted)]">
                One simple page to pick your exam, hit start, and practice without the clutter.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Exam
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMS.map((option) => (
                  <Button
                    key={option}
                    variant="secondary"
                    className={`rounded-full border border-[var(--border)] bg-transparent px-4 py-2 text-sm text-[var(--text-primary)] hover:border-[var(--accent)] ${
                      exam === option ? "border-[var(--accent)] bg-[var(--panel)] font-semibold" : ""
                    }`}
                    onClick={() => setExam(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="bg-[var(--accent)] text-[var(--text-primary)] hover:bg-[var(--accent-strong)]"
                onClick={() => router.push("/auth/signup")}
              >
                Start free drill
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:border-[var(--accent)]"
                onClick={() => router.push("/auth/signin")}
              >
                Log in
              </Button>
              <Link
                href="#pricing"
                className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
              >
                See pricing
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                Clean navigation — just three links.
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                Detail lives below or on separate pages.
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Single focus
                </p>
                <h2 className="text-2xl font-semibold">Start a drill</h2>
                <p className="text-sm text-[var(--text-muted)]">Pick your exam, choose free or pro, and go.</p>
              </div>
              <Sparkles className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Exam selected</p>
                  <p className="text-xl font-semibold">{exam}</p>
                </div>
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Free + Pro
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Timed drills", "Smart review", "Targeted sets"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--text-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button
                onClick={() => router.push("/auth/signup")}
                className="mt-5 w-full bg-[var(--accent)] text-[var(--text-primary)] hover:bg-[var(--accent-strong)]"
              >
                Start free
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push("/#pricing")}
                className="mt-2 w-full border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:border-[var(--accent)]"
              >
                Upgrade to Pro
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {metrics.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 text-left"
                >
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="font-semibold uppercase tracking-[0.18em]">{item.label}</span>
                    <Users className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="proof"
        className="relative mx-auto max-w-6xl px-6 pb-14"
        aria-labelledby="proof-heading"
      >
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Social proof
              </p>
              <h3 id="proof-heading" className="text-2xl font-semibold">
                Clear metrics under the hero, nothing else
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Learners, sets, wins — all in one simple row to keep focus on the CTA.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
              <Target className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
              Stats update automatically; no extra boxes.
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {metrics.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {item.label}
                  </p>
                  <p className="text-xl font-semibold">{item.value}</p>
                </div>
                <p className="text-xs text-[var(--text-muted)]">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative mx-auto max-w-6xl px-6 pb-14"
        aria-labelledby="how-heading"
      >
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            How it works
          </p>
          <h3 id="how-heading" className="text-2xl font-semibold">
            Three concise steps — then you drill
          </h3>
          <p className="text-sm text-[var(--text-muted)] max-w-3xl">
            Keep detail light. Visitors can tap into more copy later, but the first screen is focused on
            starting a drill.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Compass,
              title: "Pick your exam",
              body: "Choose SAT, ACT, LSAT, USMLE, or CFA right in the hero."
            },
            {
              icon: Sparkles,
              title: "Start free or log in",
              body: "Two CTAs only. Pricing link sits quietly beside them."
            },
            {
              icon: ArrowRight,
              title: "Drill immediately",
              body: "Timed or targeted drills with instant feedback — no extra setup."
            }
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
                <p className="text-sm font-semibold">{item.title}</p>
              </div>
              <p className="text-sm text-[var(--text-muted)]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="learn-more"
        className="relative mx-auto max-w-6xl px-6 pb-14"
        aria-labelledby="learn-heading"
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Minimal content, clear path
            </p>
            <h3 id="learn-heading" className="text-2xl font-semibold">
              Keep context short; let details live deeper
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Practice modes, analytics, and study-set creation move to their own pages or collapsible
              blocks. The top of the page stays focused on what StudyPilot is and why it matters.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                Limited palette with playful rocket mark.
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                Short copy, generous white space.
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                CTA stays visible across sections.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Fast + responsive
                </p>
                <p className="text-xl font-semibold">Built to load quickly</p>
                <p className="text-sm text-[var(--text-muted)]">
                  Lightweight visuals, optimized assets, and layouts that adapt smoothly to mobile.
                </p>
              </div>
              <Target className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { title: "Optimized hero", note: "Single illustration, no heavy scripts." },
                { title: "Mobile first", note: "Nav collapses cleanly, buttons stack." },
                { title: "Consistent type", note: "One display face, one body face." },
                { title: "Clear CTAs", note: "Start Free + Log in stay above the fold." }
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4"
                >
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="relative mx-auto max-w-6xl px-6 pb-20"
        aria-labelledby="pricing-heading"
      >
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Clear conversion paths
              </p>
              <h3 id="pricing-heading" className="text-2xl font-semibold">
                Start free, upgrade when ready
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Two choices, visible from the hero. Full pricing stays one scroll below.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="bg-[var(--accent)] text-[var(--text-primary)] hover:bg-[var(--accent-strong)]"
                onClick={() => router.push("/auth/signup")}
              >
                Start free drill
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:border-[var(--accent)]"
                onClick={() => router.push("/onboarding")}
              >
                Preview drill
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Free",
                price: "$0",
                detail: "Start drills with instant feedback. Ideal for first-time visitors.",
                cta: "Start free",
                action: () => router.push("/auth/signup")
              },
              {
                title: "Pro",
                price: "$18/mo",
                detail: "Long-form drills, saved analytics, and deeper review modes.",
                cta: "Upgrade to Pro",
                action: () => router.push("/pricing")
              }
            ].map((plan) => (
              <div
                key={plan.title}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {plan.title}
                  </p>
                  <span className="text-xl font-semibold">{plan.price}</span>
                </div>
                <p className="text-sm text-[var(--text-muted)]">{plan.detail}</p>
                <Button
                  onClick={plan.action}
                  className="mt-auto bg-[var(--accent)] text-[var(--text-primary)] hover:bg-[var(--accent-strong)]"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
