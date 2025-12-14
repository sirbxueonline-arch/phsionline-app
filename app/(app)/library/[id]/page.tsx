"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Flashcard } from "@/components/Flashcard";
import { QuizQuestion } from "@/components/QuizQuestion";

type Resource = {
  id: string;
  title: string;
  type: string;
  content: any;
};

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      if (!params?.id) return;
      setLoading(true);
      const client = await getSupabaseClient();
      if (!client || !user) {
        setLoading(false);
        return;
      }
      const { data } = await client
        .from("resources")
        .select("*")
        .eq("id", params.id as string)
        .eq("user_id", user.uid)
        .single();
      if (data && data.type !== "usage-log") {
        setResource(data as Resource);
      }
      setLoading(false);
    };
    fetchResource();
  }, [params, user]);

  const renderContent = () => {
    if (!resource) return null;
    if (resource.type === "both") {
      const cards = Array.isArray(resource.content?.flashcards) ? resource.content.flashcards : [];
      const quiz = Array.isArray(resource.content?.quiz) ? resource.content.quiz : [];
      const hasCards = cards.length > 0;
      const hasQuiz = quiz.length > 0;
      return (
        <div className="space-y-5">
          {hasCards && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Flashcards</p>
              <div className="grid gap-3 md:grid-cols-2">
                {cards.map((item: any, idx: number) => (
                  <Flashcard key={idx} item={item} />
                ))}
              </div>
            </div>
          )}
          {hasQuiz && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quiz</p>
              <div className="space-y-3">
                {quiz.map((item: any, idx: number) => (
                  <QuizQuestion key={idx} item={item} />
                ))}
              </div>
            </div>
          )}
          {!hasCards && !hasQuiz && <p className="text-sm text-slate-500">No flashcards or quiz questions saved.</p>}
        </div>
      );
    }
    if (resource.type === "flashcards" && resource.content?.flashcards) {
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {resource.content.flashcards.map((item: any, idx: number) => (
            <Flashcard key={idx} item={item} />
          ))}
        </div>
      );
    }
    if (resource.type === "quiz" && resource.content?.quiz) {
      return (
        <div className="space-y-3">
          {resource.content.quiz.map((item: any, idx: number) => (
            <QuizQuestion key={idx} item={item} />
          ))}
        </div>
      );
    }
    if (resource.type === "plan" && resource.content?.plan) {
      return (
        <ol className="list-decimal space-y-2 pl-4">
          {resource.content.plan.map((step: string, idx: number) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      );
    }
    if (resource.type === "explain" && resource.content?.explanation) {
      return <p className="leading-relaxed">{resource.content.explanation}</p>;
    }
    return <p className="text-sm text-slate-500">Unsupported content</p>;
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        ← Back
      </Button>
      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {resource && (
        <Card>
          <CardHeader>
            <CardTitle>{resource.title}</CardTitle>
            <CardDescription className="capitalize">{resource.type}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">{renderContent()}</CardContent>
        </Card>
      )}
    </div>
  );
}
