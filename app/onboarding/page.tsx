"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SUBJECTS = ["Math", "Science", "History", "Language", "Coding", "Business"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [defaultTool, setDefaultTool] = useState("flashcards");
  const [saving, setSaving] = useState(false);
  const [toolLocked, setToolLocked] = useState(false);

  useEffect(() => {
    if (!user) router.replace("/auth/signin");
  }, [user, router]);

  const toggleInterest = (subject: string) => {
    setInterests((prev) => (prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]));
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: name || user.displayName || "Pilot",
          email: user.email,
          interests,
          defaultTool,
          themePreference: "system"
        },
        { merge: true }
      );
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to save onboarding", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b1022] via-[#11182f] to-[#0b1022] px-4 py-12 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-300">Welcome to StudyPilot</p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Dial in your study cockpit</h1>
          <p className="text-indigo-100/80">
            Pick your focus, favorite material type, and we&apos;ll tailor the experience for you.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6 rounded-3xl border border-white/5 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="space-y-2">
              <Label className="text-sm text-indigo-100">Display name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pilot"
                className="border-white/10 bg-white/10 text-white placeholder:text-indigo-200 focus:border-purple-400"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm text-indigo-100">Study interests</Label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((subject) => {
                  const active = interests.includes(subject);
                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleInterest(subject)}
                      className={`rounded-full px-3 py-2 text-sm transition ${
                        active
                          ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                          : "border border-white/10 text-indigo-100 hover:border-purple-300/60"
                      }`}
                    >
                      {subject}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm text-indigo-100">Pick your material type</Label>
              {!toolLocked ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { key: "flashcards", title: "Flashcards", desc: "Flip, recall, and master definitions." },
                    { key: "quiz", title: "Quiz", desc: "Test yourself with auto-graded questions." },
                    { key: "both", title: "Both", desc: "Mix flashcards and quizzes together." },
                    { key: "plan", title: "Study plan", desc: "Step-by-step plan for your topic." }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setDefaultTool(item.key);
                        setToolLocked(true);
                      }}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        defaultTool === item.key
                          ? "border-purple-400 bg-purple-500/20 text-white shadow-lg shadow-purple-500/30"
                          : "border-white/10 bg-white/5 text-indigo-100 hover:border-purple-300/60"
                      }`}
                    >
                      <p className="text-lg font-semibold">{item.title}</p>
                      <p className="text-sm text-indigo-200/90">{item.desc}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-2xl border border-purple-400/70 bg-purple-500/20 px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-purple-200">Selected</p>
                    <p className="text-lg font-semibold capitalize text-white">{defaultTool}</p>
                    <p className="text-sm text-purple-100/80">We&apos;ll start with this as your default tool.</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-purple-300/70 text-white hover:bg-purple-500/40"
                    onClick={() => setToolLocked(false)}
                  >
                    Change
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end">
              <Button
                onClick={saveProfile}
                disabled={saving}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/40"
              >
                {saving ? "Saving..." : "Launch dashboard"}
              </Button>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/5 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">What you set here</p>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-indigo-200/80">Name</p>
              <p className="text-lg font-semibold">{name || "Pilot"}</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-indigo-200/80">Interests</p>
              <p className="text-lg font-semibold">
                {interests.length ? interests.join(", ") : "Choose at least one"}
              </p>
            </div>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-indigo-200/80">Default material</p>
              <p className="text-lg font-semibold capitalize">{defaultTool}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
