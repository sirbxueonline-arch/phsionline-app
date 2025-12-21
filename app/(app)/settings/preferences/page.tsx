"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function PreferencesSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [defaultCards, setDefaultCards] = useState(6);
  const [defaultTool, setDefaultTool] = useState("flashcards");
  const [translateAll, setTranslateAll] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<"en" | "tr">("en");
  const [translationSaving, setTranslationSaving] = useState(false);
  const [translationMessage, setTranslationMessage] = useState<string | null>(null);

  useEffect(() => {
    // This would pull defaults from Firestore; stubbed with local state for now
  }, []);

  const savePreferences = async () => {
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, "users", user.uid), {
      themePreference: theme,
      defaultCards,
      defaultTool
    });
    setSaving(false);
  };

  const updateLanguage = async (lang: "en" | "tr") => {
    if (!user) return;
    setTranslationSaving(true);
    setTranslationMessage(null);
    await updateDoc(doc(db, "users", user.uid), {
      translateEverything: lang !== "en",
      preferredLanguage: lang
    });
    setPreferredLanguage(lang);
    setTranslateAll(lang !== "en");
    setTranslationSaving(false);
    setTranslationMessage(
      lang === "en"
        ? "Language set to English (default)."
        : "Turkish translation enabled for your account (site, quizzes, and flashcards)."
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Theme and generation defaults.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Theme</p>
          <div className="flex gap-2">
            {["light", "dark", "system"].map((mode) => (
              <Button
                key={mode}
                variant={theme === mode ? "default" : "outline"}
                onClick={() => setTheme(mode)}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Default cards/questions</p>
          <input
            type="number"
            value={defaultCards}
            onChange={(e) => setDefaultCards(Number(e.target.value))}
            className="w-32 rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Default tool</p>
          <div className="flex gap-2">
            {["flashcards", "quiz", "explain", "plan"].map((tool) => (
              <Button
                key={tool}
                variant={defaultTool === tool ? "default" : "outline"}
                onClick={() => setDefaultTool(tool)}
              >
                {tool}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Language</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Translate the entire app experience (including quizzes and flashcards). English is the default.
          </p>
          <div className="flex gap-2">
            <Button
              variant={preferredLanguage === "en" ? "default" : "outline"}
              onClick={() => updateLanguage("en")}
              disabled={translationSaving}
            >
              English
            </Button>
            <Button
              variant={preferredLanguage === "tr" ? "default" : "outline"}
              onClick={() => updateLanguage("tr")}
              disabled={translationSaving}
            >
              Turkish
            </Button>
          </div>
          {translationSaving && <p className="text-xs text-slate-500 dark:text-slate-400">Saving language...</p>}
          {translationMessage && <p className="text-xs text-emerald-600 dark:text-emerald-400">{translationMessage}</p>}
        </div>
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? "Saving..." : "Save preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
