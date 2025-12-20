// Optional Firebase Admin helper used by API routes that need token verification.
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App | undefined;

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const canInitWithJson = typeof serviceAccountJson === "string" && serviceAccountJson.trim().length > 0;
const canInitWithFields = projectId && clientEmail && privateKey;

if (typeof window === "undefined" && !adminApp) {
  if (!canInitWithJson && !canInitWithFields) {
    console.warn("firebase-admin init skipped: missing service account credentials");
  } else {
    try {
      const credential = canInitWithJson
        ? cert(JSON.parse(serviceAccountJson as string))
        : cert({
            projectId,
            clientEmail,
            privateKey: privateKey as string
          });
      const appOptions = projectId ? { credential, projectId } : { credential };
      adminApp = initializeApp(appOptions);
    } catch (err) {
      console.warn("firebase-admin init failed", err);
    }
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

let adminDb: ReturnType<typeof getFirestore> | null = null;
if (adminApp) {
  try {
    adminDb = getFirestore(adminApp);
  } catch (err) {
    console.warn("firebase-admin Firestore init failed", err);
  }
}

export { adminDb };
