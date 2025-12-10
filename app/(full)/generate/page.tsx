"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

type Tool = "flashcards" | "quiz" | "explain" | "plan";

type GenerationResult =
  | { flashcards: FlashcardItem[] }
  | { quiz: QuizItem[] }
  | { explanation: string }
  | { plan: string[] };

const defaultPrompt =
  "Provide a short passage or topic (e.g. 'Basics of photosynthesis' or paste your notes) and choose a tool.";

export default function FullGeneratePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tool, setTool] = useState<Tool>("flashcards");
  const [subject, setSubject] = useState("");
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(6);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [usage, setUsage] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const controller = useMemo(() => new AbortController(), []);

  useEffect(() => {
    const fetchUsage = async () => {
      const client = await getSupabaseClient();
      if (!client || !user) return;
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count: usageCount } = await client
        .from("resources")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.uid)
        .gte("created_at", startOfMonth);
      if (typeof usageCount === "number") {
        setUsage(usageCount);
        if (usageCount >= 20) setLimitReached(true);
      }
    };
    fetchUsage();
  }, [user]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: user ? `Bearer ${await user.getIdToken()}` : ""
        },
        signal: controller.signal,
        body: JSON.stringify({
          tool,
          text: prompt || defaultPrompt,
          settings: { count, difficulty, subject }
        })
      });
      if (res.status === 429 || res.status === 403) {
        setLimitReached(true);
        setError("Monthly free limit reached. Upgrade to continue.");
        return;
      }
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setResult(data);

      // Immediately route to full result view
      const payload = {
        ...data,
        type: tool,
        title: subject || `Generated ${tool}`,
        subject
      };
      const encoded = encodeURIComponent(btoa(JSON.stringify(payload)));
      router.push(`/generate/view?data=${encoded}`);
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Generation cancelled");
      } else {
        setError(err.message || "Generation failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;
    setSaving(true);
    const client = await getSupabaseClient();
    if (!client) {
      setSaving(false);
      return;
    }
    const title = subject || `Generated ${tool} - ${formatDate(new Date())}`;
    const { error: insertError } = await client.from("resources").insert({
      user_id: user.uid,
      type: tool,
      title,
      subject,
      content: result
    });
    if (insertError) {
      setError(insertError.message);
    } else {
      setUsage((prev) => (typeof prev === "number" ? prev + 1 : prev));
    }
    setSaving(false);
  };

  const cancelGeneration = () => {
    controller.abort();
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 opacity-30 blur-3xl gradient-bg" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-16">
        <div>
          <h1 className="text-3xl font-semibold text-white">AI Generation Studio</h1>
          <p className="text-slate-300">
            Choose a tool, paste a topic, and generate study-ready content. Usage: {usage ?? "–"}/20 this month.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/60 text-white shadow-2xl">
          <CardHeader>
            <CardTitle>Generation prompt</CardTitle>
            <CardDescription className="text-slate-300">
              Describe your topic and pick how you want it delivered.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {(["flashcards", "quiz", "explain", "plan"] as Tool[]).map((t) => (
                <Button
                  key={t}
                  variant={tool === t ? "default" : "outline"}
                  size="sm"
                  className={tool === t ? "bg-brand text-white" : "border-slate-700 text-slate-200"}
                  onClick={() => setTool(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-200">Subject or title</Label>
                <Input
                  placeholder="Photosynthesis basics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="border-slate-700 bg-slate-900 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-200">Count (if applicable)</Label>
                  <Input
                    type="number"
                    min={3}
                    max={20}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="border-slate-700 bg-slate-900 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-200">Difficulty</Label>
                  <Input
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="border-slate-700 bg-slate-900 text-white"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Topic or paste text</Label>
              <Textarea
                minLength={4}
                rows={8}
                placeholder={defaultPrompt}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="border-slate-700 bg-slate-900 text-white"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleGenerate} disabled={loading || limitReached} className="bg-brand text-white">
                {loading ? "Generating..." : "Generate"}
              </Button>
              <Button onClick={cancelGeneration} variant="outline" disabled={!loading} className="border-slate-700 text-white">
                Cancel
              </Button>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
