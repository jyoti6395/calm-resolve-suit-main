import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export interface UserProfile {
  uid?: string;
  email: string;
  role: "customer" | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
  fullName?: string;
  company?: string;
  status?: string;
}

/**
 * Creates a new user with Email/Password and registers a custom profile document in Firestore.
 */
export async function signUp(
  email: string,
  password: string,
  additionalData?: { fullName?: string; company?: string },
): Promise<FirebaseUser> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user document in Firestore users collection
  const userDocRef = doc(db, "users", user.uid);
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || email,
    role: "customer",
    status: "active",
    createdAt: serverTimestamp(),
    ...additionalData,
  };

  await setDoc(userDocRef, userProfile);
  return user;
}

/**
 * Logs in a user using Email and Password.
 */
export async function logIn(email: string, password: string): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create/update user document in Firestore users collection
  const userDocRef = doc(db, "users", user.uid);
  await setDoc(
    userDocRef,
    {
      uid: user.uid,
      status: "active",
    },
    { merge: true },
  );

  return user;
}

/**
 * Logs out the currently signed-in user.
 */
export async function logOut(): Promise<void> {
  await signOut(auth);
}

/**
 * Fetches the user role from their Firestore profile document.
 */
export async function getUserRole(uid: string): Promise<string | null> {
  const profile = await getUserProfile(uid);
  return profile?.role || null;
}

/**
 * Fetches the complete user profile from Firestore.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDocRef = doc(db, "users", uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data() as UserProfile;
  }

  return null;
}
/**
 * Updates the user profile document in Firestore.
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const userDocRef = doc(db, "users", uid);
  await setDoc(userDocRef, updates, { merge: true });
}

/**
 * Sends a password reset link using Firebase Auth.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const trimmedEmail = email.trim().toLowerCase();

  // Send the password reset email using Firebase Auth.
  // It handles sending the email if the account exists.
  await sendPasswordResetEmail(auth, trimmedEmail);
}
