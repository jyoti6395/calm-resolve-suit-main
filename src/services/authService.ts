import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export interface UserProfile {
  email: string;
  role: "customer" | string;
  createdAt: any;
  fullName?: string;
  company?: string;
}

/**
 * Creates a new user with Email/Password and registers a custom profile document in Firestore.
 */
export async function signUp(email: string, password: string, additionalData?: { fullName?: string; company?: string }): Promise<FirebaseUser> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user document in Firestore users collection
  const userDocRef = doc(db, "users", user.uid);
  const userProfile: UserProfile = {
    email: user.email || email,
    role: "customer",
    createdAt: serverTimestamp(),
    ...additionalData
  };

  await setDoc(userDocRef, userProfile);
  return user;
}

/**
 * Logs in a user using Email and Password.
 */
export async function logIn(email: string, password: string): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
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

