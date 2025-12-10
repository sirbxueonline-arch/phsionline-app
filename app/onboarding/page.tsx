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
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-brand">Welcome aboard</p>
        <h1 className="text-3xl font-semibold">Let&apos;s personalize your cockpit</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Choose your interests and defaults so we can tailor StudyPilot for you.
        </p>
      </div>
      <div className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-2">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Pilot" />
        </div>
        <div className="space-y-3">
          <Label>Study interests</Label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((subject) => {
              const active = interests.includes(subject);
              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleInterest(subject)}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    active
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  {subject}
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Default generation tool</Label>
          <div className="flex flex-wrap gap-2">
            {["flashcards", "quiz", "explain", "plan"].map((tool) => (
              <button
                key={tool}
                onClick={() => setDefaultTool(tool)}
                type="button"
                className={`rounded-md px-3 py-2 text-sm capitalize ${
                  defaultTool === tool
                    ? "bg-brand text-white"
                    : "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                }`}
              >
                {tool}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Continue to dashboard"}
          </Button>
        </div>
      </div>
    </main>
  );
}
