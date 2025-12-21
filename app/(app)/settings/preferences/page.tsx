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
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? "Saving..." : "Save preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
