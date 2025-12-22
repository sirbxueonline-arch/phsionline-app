"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { collection, doc, getDocs, query as fsQuery, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowUpRight, RefreshCcw, Share2, Trash2 } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const detect = () => {
      if (typeof window === "undefined") return;
      setIsMobile(window.innerWidth < 768);
    };
    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const q = fsQuery(collection(db, "resources"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const items = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .filter((r) => r.type !== "usage-log" && !r.archived)
          .sort(
            (a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime()
          );
        setResources(items as Resource[]);
      } catch (err) {
        console.error("Failed to load library", err);
        setError("Failed to load your library. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [user]);

  const filtered = query
    ? resources.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()))
    : resources;

  const handleShare = (resId: string, title?: string) => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/library/${resId}`;
    const shareTitle = title || "Study set";
    if (navigator.share) {
      navigator.share({ title: shareTitle, url }).catch(() => {
        navigator.clipboard?.writeText(url).catch(() => {});
      });
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
  };

  const handleArchive = async (resId: string) => {
    if (!user) return;
    setDeletingId(resId);
    try {
      const ref = doc(db, "resources", resId);
      await updateDoc(ref, { archived: true, archivedAt: new Date().toISOString() });
      setResources((prev) => prev.filter((r) => r.id !== resId));
    } catch (err) {
      console.error("Archive failed", err);
    } finally {
      setDeletingId(null);
    }
  };

  const prettyType = (type?: string) => {
    if (!type) return "Resource";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const cleanedTitle = (res: Resource) => {
    const raw = res.title || "";
    const stripped = raw.replace(/^(study set\s*-\s*)/i, "").replace(/^(generated\s*)/i, "").trim();
    return stripped || prettyType(res.type);
  };

  const truncate = (val: string, limit = 80) => {
    if (!val) return "";
    return val.length > limit ? `${val.slice(0, limit - 3)}...` : val;
  };


  const getSummary = (res: Resource) => {
    const content = (res as any)?.content;
    const hasFlashcards = Array.isArray(content?.flashcards) && content.flashcards.length > 0;
    const hasQuiz = Array.isArray(content?.quiz) && content.quiz.length > 0;
    if (res.type === "flashcards" && hasFlashcards) return content.flashcards[0]?.question || "";
    if (res.type === "quiz" && hasQuiz) return content.quiz[0]?.question || "";
    if (res.type === "both") {
      const parts = [];
      if (hasFlashcards) parts.push(content.flashcards[0]?.question);
      if (hasQuiz) parts.push(content.quiz[0]?.question);
      return parts.filter(Boolean).join(" • ");
    }
    return "";
  };

  return (
    <div className="space-y-6 min-h-screen">
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
      {error && !loading && <p className="text-sm text-red-500">{error}</p>}
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
            <CardContent className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between md:gap-3">
              <div className="space-y-1 md:max-w-2xl md:flex-1">
                <p className="text-lg font-semibold capitalize">{truncate(cleanedTitle(res), 72)}</p>
                {res.subject && <p className="text-sm text-slate-500">{truncate(res.subject, 96)}</p>}
                {getSummary(res) && <p className="text-sm text-slate-500">{truncate(getSummary(res), 110)}</p>}
              </div>
              <div
                className={`flex w-full flex-wrap items-center gap-2 ${isMobile ? "justify-start" : "md:w-auto md:justify-end"}`}
              >
                <Link href={`/study/${res.id}`}>
                  <Button size="sm" className="gap-1 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900">
                    <RefreshCcw className="h-4 w-4" />
                    Retake
                  </Button>
                </Link>
                <Link href={`/library/${res.id}`}>
                  <Button variant="secondary" size="sm" className="gap-1">
                    <ArrowUpRight className="h-4 w-4" />
                    Open
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare(res.id, cleanedTitle(res))}
                  aria-label="Share"
                  className="h-9 w-9 rounded-md border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleArchive(res.id)}
                  disabled={deletingId === res.id}
                  aria-label="Remove"
                  className="h-9 w-9 rounded-md border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
