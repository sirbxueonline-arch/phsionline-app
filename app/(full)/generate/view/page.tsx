"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Flashcard } from "@/components/Flashcard";
import { QuizQuestion } from "@/components/QuizQuestion";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

type FullResult =
  | { flashcards: { question: string; answer: string }[]; mocked?: boolean; type?: string; title?: string; subject?: string }
  | { quiz: any[]; mocked?: boolean; type?: string; title?: string; subject?: string }
  | { plan: string[]; mocked?: boolean; type?: string; title?: string; subject?: string }
  | { explanation: string; mocked?: boolean; type?: string; title?: string; subject?: string }
  | null;

export default function FullscreenGenerateView() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const data = params.get("data");
  const decoded: FullResult = useMemo(() => {
    if (!data) return null;
    try {
      const json = decodeURIComponent(data);
      const payload = JSON.parse(atob(json));
      return payload;
    } catch (err) {
      console.error("Failed to parse full view data", err);
      return null;
    }
  }, [data]);

  const handleSave = async () => {
    if (!decoded || !user) return;
    setSaving(true);
    const client = await getSupabaseClient();
    if (!client) {
      setSaving(false);
      return;
    }
    const type = (decoded as any).type || "generated";
    const title = (decoded as any).title || `Generated ${type}`;
    const subject = (decoded as any).subject || null;
    const { error } = await client.from("resources").insert({
      user_id: user.uid,
      type,
      title,
      subject,
      content: decoded
    });
    if (error) {
      console.error("Save failed", error);
    }
    setSaving(false);
  };

  const renderContent = () => {
    if (!decoded) return <p className="text-sm text-slate-400">No result found. Regenerate to view.</p>;
    if ("flashcards" in decoded) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {decoded.flashcards.map((item, idx) => (
            <Flashcard key={idx} item={item} />
          ))}
        </div>
      );
    }
    if ("quiz" in decoded) {
      return (
        <div className="space-y-4">
          {decoded.quiz.map((item: any, idx: number) => (
            <QuizQuestion key={idx} item={item} />
          ))}
        </div>
      );
    }
    if ("plan" in decoded) {
      return (
        <ol className="list-decimal space-y-2 pl-4 text-lg">
          {decoded.plan.map((step: string, idx: number) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      );
    }
    if ("explanation" in decoded) {
      return <p className="text-lg leading-relaxed">{decoded.explanation}</p>;
    }
    return <p className="text-sm text-slate-400">Unsupported content.</p>;
  };

  const isMock = !!(decoded as any)?.mocked;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 pb-16 pt-24">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="w-fit text-white" onClick={() => router.back()}>
          ← Back
        </Button>
        <Button onClick={handleSave} disabled={saving || !decoded} className="bg-brand text-white">
          {saving ? "Saving..." : "Save to library"}
        </Button>
      </div>
      <Card className="border-slate-800 bg-slate-900/70 text-white shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">{(decoded as any)?.title || "Generated content"}</CardTitle>
          <CardDescription className="text-slate-300">
            Full-screen focus view. {isMock ? "Mock data (configure API key for real generations)." : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
