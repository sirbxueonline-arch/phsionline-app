"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flashcard } from "@/components/Flashcard";
import { QuizQuestion } from "@/components/QuizQuestion";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, BookmarkCheck, Clock3, Sparkles } from "lucide-react";

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
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.15),transparent_35%),radial-gradient(circle_at_80%_15%,rgba(124,58,237,0.16),transparent_30%)]" />
      <div className="relative mx-auto flex max-w-5xl flex-col gap-5 px-4 pb-16 pt-16 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" className="w-fit text-slate-100 hover:text-white" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Clock3 className="h-4 w-4" />
            {formatDate(new Date())}
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 text-white shadow-2xl backdrop-blur">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                <span className="rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">
                  {(decoded as any)?.type || "Generated"}
                </span>
                {(decoded as any)?.subject && (
                  <span className="rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">
                    {(decoded as any).subject}
                  </span>
                )}
                {isMock && (
                  <span className="rounded-full bg-amber-400/20 px-2 py-1 text-amber-100 ring-1 ring-amber-300/40">
                    Mock data
                  </span>
                )}
              </div>
              <CardTitle className="text-2xl">{(decoded as any)?.title || "Generated content"}</CardTitle>
              <CardDescription className="text-slate-300">
                Full-screen focus view. Save to your library to study later.
              </CardDescription>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !decoded}
              className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-900 shadow-lg"
            >
              {saving ? (
                "Saving..."
              ) : (
                <span className="flex items-center gap-2">
                  <BookmarkCheck className="h-4 w-4" /> Save to library
                </span>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                Tip: share or export from the library after saving. This view keeps things focused for study.
              </p>
            </div>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
