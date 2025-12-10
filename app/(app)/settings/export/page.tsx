"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExportSettingsPage() {
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    setMessage("Preparing export...");
    try {
      const res = await fetch("/api/export");
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
