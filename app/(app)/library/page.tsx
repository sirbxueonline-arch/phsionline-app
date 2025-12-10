"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Resource = {
  id: string;
  title: string;
  type: string;
  subject?: string | null;
  created_at?: string;
  content?: any;
};

export default function LibraryPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      const client = await getSupabaseClient();
      if (!client || !user) {
        setLoading(false);
        return;
      }
      const { data } = await client
        .from("resources")
        .select("*")
        .eq("user_id", user.uid)
        .order("created_at", { ascending: false });
      if (data) setResources(data as Resource[]);
      setLoading(false);
    };
    fetchResources();
  }, [user]);

  const filtered = query
    ? resources.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()))
    : resources;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Library</h1>
          <p className="text-slate-600 dark:text-slate-300">
            All of your saved flashcards, quizzes, explanations, and plans.
          </p>
        </div>
        <Link href="/generate">
          <Button>Generate new</Button>
        </Link>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search by title..."
          className="md:max-w-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="text-sm text-slate-500">{filtered.length} items</p>
      </div>
      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {!loading && filtered.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Empty library</CardTitle>
            <CardDescription>Save generated content to see it here.</CardDescription>
          </CardHeader>
        </Card>
      )}
      <div className="grid gap-3">
        {filtered.map((res) => (
          <Card key={res.id} className="hover:border-brand/60">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="text-lg font-semibold">{res.title}</p>
                <p className="text-sm text-slate-500">
                  {res.type} · {res.subject || "General"} · {formatDate(res.created_at)}
                </p>
              </div>
              <Link href={`/library/${res.id}`}>
                <Button variant="outline" size="sm">
                  Open
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
