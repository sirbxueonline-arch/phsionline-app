"use client";

import React from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type SocialLinks = {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
};

type Profile = {
  name?: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string | null;
  social?: SocialLinks;
  timezone?: string | null;
  role?: string;
  permissions?: string[];
  onboarding?: {
    completed?: boolean;
    completedAt?: string | null;
    step?: string | null;
  };
  onboardingCompleted?: boolean;
  defaultTool?: string;
  themePreference?: "light" | "dark" | "system";
  referralCode?: string;
  interests?: string[];
};

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const getBrowserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchProfile = React.useCallback(
    async (uid?: string) => {
      if (!uid) {
        setProfile(null);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          setProfile(snap.data() as Profile);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    },
    [setProfile]
  );

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        await fetchProfile(nextUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [fetchProfile]);

  const refreshProfile = React.useCallback(async () => {
    if (user?.uid) {
      await fetchProfile(user.uid);
    }
  }, [user, fetchProfile]);

  const signOutUser = React.useCallback(async () => {
    await signOut(auth);
    setProfile(null);
  }, []);

  // Ensure each user has a profile document with defaults
  React.useEffect(() => {
    if (!user) return;
    const ensureProfile = async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        const existing = (snap.data() as Profile | undefined) || {};
        const timezone = existing.timezone || getBrowserTimezone();
        const profileDefaults = {
          name: existing.name || user.displayName || "Pilot",
          displayName: existing.displayName || existing.name || user.displayName || "Pilot",
          email: existing.email || user.email || undefined,
          avatarUrl: existing.avatarUrl ?? user.photoURL ?? null,
          social: existing.social || {},
          timezone: timezone || null,
          role: existing.role || "user",
          permissions: existing.permissions || [],
          onboarding:
            existing.onboarding || {
              completed: existing.onboardingCompleted ?? false,
              completedAt: null,
              step: existing.onboardingCompleted ? "completed" : "pending"
            },
          onboardingCompleted: existing.onboardingCompleted ?? existing.onboarding?.completed ?? false,
          referralCode: existing.referralCode || user.uid.slice(0, 8),
          defaultTool: existing.defaultTool || "flashcards",
          createdAt: (existing as any)?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(ref, profileDefaults, { merge: true });
      } catch (err) {
        console.error("Failed to ensure profile", err);
      }
    };
    ensureProfile();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
