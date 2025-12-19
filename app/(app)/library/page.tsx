"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { collection, getDocs, orderBy, query as fsQuery, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Resource = {
  id: string;
  title: string;
  type: string;
  subject?: string | null;
  createdAt?: string;
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
      if (!user) {
        setLoading(false);
        return;
      }
      const q = fsQuery(collection(db, "resources"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const items = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }))
        .filter((r) => r.type !== "usage-log");
      setResources(items as Resource[]);
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
            <CardTitle>No study sets yet</CardTitle>
            <CardDescription>Let's make your first one.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/generate">
              <Button>Create my study set</Button>
            </Link>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-3">
        {filtered.map((res) => (
          <Card key={res.id} className="hover:border-brand/60">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="text-lg font-semibold">{res.title}</p>
                <p className="text-sm text-slate-500">
                  {res.type} | {res.subject || "General"} | {formatDate(res.createdAt)}
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
