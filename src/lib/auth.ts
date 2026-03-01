import {
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
} from "./firestore";
import type { UserProfile } from "@/types";

const ALLOWED_DOMAIN = "neu.edu.ph";

export function isNeuEmail(email: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const user: User = result.user;

  if (!isNeuEmail(user.email)) {
    await firebaseSignOut(auth);
    throw new Error(
      `Only @${ALLOWED_DOMAIN} institutional email addresses are allowed.`
    );
  }

  let profile = await getUserProfile(user.uid);

  if (!profile) {
    const newProfile: Omit<UserProfile, "createdAt" | "updatedAt"> = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName ?? user.email!.split("@")[0],
      photoURL: user.photoURL,
      privilege: "least",
      college: null,
      firstVisitCompleted: false,
      isDisabled: false,
    };
    await createUserProfile(newProfile);
    profile = await getUserProfile(user.uid);
  } else {
    await updateUserProfile(user.uid, {
      displayName: user.displayName ?? profile.displayName,
      photoURL: user.photoURL ?? profile.photoURL,
    });
    profile = await getUserProfile(user.uid);
  }

  if (!profile) throw new Error("Failed to load user profile.");
  if (profile.isDisabled) {
    await firebaseSignOut(auth);
    throw new Error(
      "Your account has been disabled. Please contact the CSD office."
    );
  }

  return profile;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}
