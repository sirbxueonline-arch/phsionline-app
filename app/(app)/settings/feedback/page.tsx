"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export default function FeedbackSettingsPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const submitFeedback = async () => {
    if (!message) return;
    try {
      await addDoc(collection(db, "feedback"), {
        uid: user?.uid || "anon",
        message,
        createdAt: new Date().toISOString()
      });
      setStatus("Thanks for sharing feedback!");
      setMessage("");
    } catch (err) {
      setStatus("Failed to send. Try again later.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
        <CardDescription>Tell us what you want to see next.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          rows={5}
          placeholder="Share your thoughts, issues, or ideas..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={submitFeedback} disabled={!message}>
          Submit feedback
        </Button>
        {status && <p className="text-sm text-slate-600 dark:text-slate-300">{status}</p>}
      </CardContent>
    </Card>
  );
}
