import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
  deleteUser,
  confirmPasswordReset as firebaseConfirmPasswordReset,
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

  // Fetch profile to verify role before allowing login success
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const profile = userDocSnap.data() as UserProfile;
    const role = profile.role || "customer";

    // Technician login is temporarily disabled
    if (role === "technician") {
      await signOut(auth);
      throw new Error("Technician login is disabled.");
    }

    if (role !== "customer") {
      await signOut(auth);
      throw new Error("Authentication failed. Please check your account or contact support.");
    }
  }

  // Create/update user document in Firestore users collection
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

  // 1. Verify the account role before allowing a password reset
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", trimmedEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const profile = querySnapshot.docs[0].data() as UserProfile;
      const role = profile.role || "customer";

      // Prevent super_admin or other internal roles from resetting passwords via the public app
      if (role !== "customer" && role !== "technician") {
        // Silently return to prevent user enumeration attacks
        return;
      }
    }
  } catch (error) {
    // Gracefully handle query permission/network errors and proceed with the password reset
    console.warn("Bypassing client-side role check during password reset:", error);
  }

  // 2. Send the password reset email using Firebase Auth.
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://calm-resolve-suit-main.pages.dev";
  await sendPasswordResetEmail(auth, trimmedEmail, {
    url: `${origin}/reset-password`,
  });
}

/**
 * Confirms a password reset using the out-of-band code sent via email.
 */
export async function confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
  await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
}

/**
 * Deletes the currently signed-in user's Firebase Auth account.
 * Note: This does NOT delete their Firestore profile document.
 */
export async function deleteAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user found.");
  }
  await deleteUser(user);
}
