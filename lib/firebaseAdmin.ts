// Optional Firebase Admin helper used by API routes that need token verification.
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App | undefined;

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (typeof window === "undefined" && !adminApp && serviceAccountJson) {
  try {
    adminApp = initializeApp({
      credential: cert(JSON.parse(serviceAccountJson))
    });
  } catch (err) {
    console.warn("firebase-admin init skipped", err);
  }
} else if (getApps().length) {
  adminApp = getApps()[0];
}

export async function verifyToken(idToken: string) {
  if (!adminApp) return null;
  try {
    const decoded = await getAuth(adminApp).verifyIdToken(idToken);
    return decoded;
  } catch (err) {
    console.error("Failed to verify token", err);
    return null;
  }
}

export function getAdminFirestore() {
  if (!adminApp) return null;
  try {
    return getFirestore(adminApp);
  } catch (err) {
    console.error("Failed to init admin Firestore", err);
    return null;
  }
}
