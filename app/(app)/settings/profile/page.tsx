"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const detectTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
};

export default function ProfileSettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [displayName, setDisplayName] = useState(profile?.displayName || profile?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || "");
  const [timezone, setTimezone] = useState(profile?.timezone || detectTimezone());
  const [twitter, setTwitter] = useState(profile?.social?.twitter || "");
  const [linkedin, setLinkedin] = useState(profile?.social?.linkedin || "");
  const [github, setGithub] = useState(profile?.social?.github || "");
  const [website, setWebsite] = useState(profile?.social?.website || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile?.name || "");
    setDisplayName(profile?.displayName || profile?.name || "");
    setAvatarUrl(profile?.avatarUrl || "");
    setTimezone(profile?.timezone || detectTimezone());
    setTwitter(profile?.social?.twitter || "");
    setLinkedin(profile?.social?.linkedin || "");
    setGithub(profile?.social?.github || "");
    setWebsite(profile?.social?.website || "");
  }, [profile]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const social = {
      ...(twitter.trim() ? { twitter: twitter.trim() } : {}),
      ...(linkedin.trim() ? { linkedin: linkedin.trim() } : {}),
      ...(github.trim() ? { github: github.trim() } : {}),
      ...(website.trim() ? { website: website.trim() } : {})
    };
    await updateDoc(doc(db, "users", user.uid), {
      name: name || displayName || user.displayName || "Pilot",
      displayName: displayName || name || user.displayName || "Pilot",
      avatarUrl: avatarUrl.trim() || null,
      timezone: timezone.trim() || null,
      social,
      updatedAt: new Date().toISOString()
    });
    await refreshProfile();
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your identity and contact details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Legal name" />
          </div>
          <div className="space-y-2">
            <Label>Display name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="What learners see"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Avatar URL</Label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
            />
            <p className="text-xs text-slate-500">Use an image link for now; uploads land in Storage later.</p>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="America/New_York"
            />
            <p className="text-xs text-slate-500">Helps us timestamp study streaks and reminders accurately.</p>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Social links</Label>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="Twitter / X"
            />
            <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn" />
            <Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="GitHub" />
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website" />
          </div>
        </div>

        <Button onClick={saveProfile} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
