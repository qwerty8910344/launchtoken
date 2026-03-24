import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "launchtoken-online.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);

function getResetActionCodeSettings() {
  const baseUrl = window.location.origin;
  return {
    url: `${baseUrl}/reset-password`,
    handleCodeInApp: true,
  };
}

async function ensureFirebaseUser(email: string): Promise<void> {
  const tempPassword = "TempReset_" + Math.random().toString(36).slice(2) + "!1Aa";
  try {
    await createUserWithEmailAndPassword(firebaseAuth, email, tempPassword);
    await firebaseAuth.signOut();
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      return;
    }
    throw error;
  }
}

export async function sendResetEmail(email: string): Promise<void> {
  const actionCodeSettings = getResetActionCodeSettings();
  try {
    await sendPasswordResetEmail(firebaseAuth, email, actionCodeSettings);
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      await ensureFirebaseUser(email);
      await sendPasswordResetEmail(firebaseAuth, email, actionCodeSettings);
    } else {
      throw error;
    }
  }
}

export async function verifyResetCode(oobCode: string): Promise<string> {
  return await verifyPasswordResetCode(firebaseAuth, oobCode);
}

export async function confirmReset(oobCode: string, newPassword: string): Promise<void> {
  await confirmPasswordReset(firebaseAuth, oobCode, newPassword);
}
