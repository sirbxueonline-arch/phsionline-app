"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function ProfileSettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, "users", user.uid), { name });
    await refreshProfile();
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your identity and contact details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled />
        </div>
        <div className="space-y-2">
          <Label>Avatar</Label>
          <p className="text-sm text-slate-500">
            Avatar uploads coming soon. We&apos;ll store it in Firebase Storage.
          </p>
        </div>
        <Button onClick={saveProfile} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
