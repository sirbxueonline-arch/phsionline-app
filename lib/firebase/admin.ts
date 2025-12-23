import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const canInitWithJson = typeof serviceAccountJson === "string" && serviceAccountJson.trim().length > 0;
const canInitWithFields = projectId && clientEmail && privateKey;

const ensureAdminApp = () => {
  if (typeof window !== "undefined") return null;
  if (getApps().length) return getApp();
  if (!canInitWithJson && !canInitWithFields) {
    console.warn("firebase-admin init skipped: missing service account credentials");
    return null;
  }
  try {
    const credential = canInitWithJson
      ? cert(JSON.parse(serviceAccountJson as string))
      : cert({
          projectId,
          clientEmail,
          privateKey: privateKey as string
        });
    const appOptions = projectId ? { credential, projectId } : { credential };
    return initializeApp(appOptions);
  } catch (err) {
    console.warn("firebase-admin init failed", err);
    return null;
  }
};

const adminApp = ensureAdminApp();

export const adminAuth = adminApp ? getAuth(adminApp) : null;
