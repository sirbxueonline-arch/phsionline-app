"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";

export default function ExportSettingsPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    if (!user) {
      setMessage("Please sign in to export your data.");
      return;
    }
    setMessage("Preparing export...");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/export", {
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error("Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "studypilot-export.json";
      a.click();
      setMessage("Export downloaded.");
    } catch (err) {
      setMessage("Export failed. Coming soon.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data export</CardTitle>
        <CardDescription>Download your profile and library data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleExport}>Export JSON</Button>
        {message && <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>}
        <p className="text-xs text-slate-500">
          This is a basic export. Full GDPR-friendly export will arrive soon.
        </p>
      </CardContent>
    </Card>
  );
}
