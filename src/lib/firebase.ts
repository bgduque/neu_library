import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (typeof window !== "undefined") {
  const missing = Object.entries(requiredEnvVars)
    .filter(([, v]) => !v)
    .map(([k]) => `NEXT_PUBLIC_FIREBASE_${k.replace(/([A-Z])/g, "_$1").toUpperCase()}`);
  if (missing.length > 0) {
    console.error(
      `[NEU Library] Missing Firebase environment variables: ${missing.join(", ")}. ` +
        "Copy .env.example to .env.local and fill in your Firebase project values."
    );
  }
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey ?? "placeholder",
  authDomain: requiredEnvVars.authDomain ?? "placeholder.firebaseapp.com",
  projectId: requiredEnvVars.projectId ?? "placeholder",
  storageBucket: requiredEnvVars.storageBucket ?? "placeholder.appspot.com",
  messagingSenderId: requiredEnvVars.messagingSenderId ?? "000000000000",
  appId: requiredEnvVars.appId ?? "1:000000000000:web:placeholder",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: "neu.edu.ph",
  prompt: "select_account",
});
