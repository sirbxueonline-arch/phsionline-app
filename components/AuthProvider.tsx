"use client";

import React from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Profile = {
  name?: string;
  email?: string;
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

  // Ensure each user has a referral code set
  React.useEffect(() => {
    if (!user) return;
    const ensureReferral = async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            email: user.email,
            name: user.displayName || "Pilot",
            createdAt: new Date().toISOString(),
            referralCode: user.uid.slice(0, 8)
          });
        } else if (!snap.data()?.referralCode) {
          await updateDoc(ref, { referralCode: user.uid.slice(0, 8) });
        }
      } catch (err) {
        console.error("Failed to ensure referral code", err);
      }
    };
    ensureReferral();
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
