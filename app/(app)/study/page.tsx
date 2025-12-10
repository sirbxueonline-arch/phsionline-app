"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

type Resource = { id: string; title: string; type: string; subject?: string | null };

export default function StudyPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      const client = await getSupabaseClient();
      if (!client || !user) return;
      const { data } = await client
        .from("resources")
        .select("id,title,type,subject")
        .eq("user_id", user.uid)
        .in("type", ["flashcards", "quiz"]);
      if (data) setResources(data as Resource[]);
    };
    fetchResources();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Study mode</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Choose a flashcard set or quiz to practice.
        </p>
      </div>
      <div className="grid gap-3">
        {resources.map((res) => (
          <Card key={res.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <CardTitle className="text-lg">{res.title}</CardTitle>
                <CardDescription>
                  {res.type} · {res.subject || "General"}
                </CardDescription>
              </div>
              <Link href={`/study/${res.id}`}>
                <Button>Start</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        {resources.length === 0 && (
          <p className="text-sm text-slate-500">No study-ready items yet. Save a quiz or flashcards first.</p>
        )}
      </div>
    </div>
  );
}
