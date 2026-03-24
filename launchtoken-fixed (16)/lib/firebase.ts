import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "launchtoken-online.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);

function getResetActionCodeSettings() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  return { url: `${baseUrl}/reset-password`, handleCodeInApp: true };
}
async function ensureFirebaseUser(email: string): Promise<void> {
  const tempPassword = "TempReset_" + Math.random().toString(36).slice(2) + "!1Aa";
  try { await createUserWithEmailAndPassword(firebaseAuth, email, tempPassword); await firebaseAuth.signOut(); }
  catch (error: any) { if (error.code === "auth/email-already-in-use") return; throw error; }
}
export async function sendResetEmail(email: string): Promise<void> {
  const actionCodeSettings = getResetActionCodeSettings();
  try { await sendPasswordResetEmail(firebaseAuth, email, actionCodeSettings); }
  catch (error: any) {
    if (error.code === "auth/user-not-found") { await ensureFirebaseUser(email); await sendPasswordResetEmail(firebaseAuth, email, actionCodeSettings); }
    else throw error;
  }
}
export async function verifyResetCode(oobCode: string): Promise<string> { return await verifyPasswordResetCode(firebaseAuth, oobCode); }
export async function confirmReset(oobCode: string, newPassword: string): Promise<void> { await confirmPasswordReset(firebaseAuth, oobCode, newPassword); }
