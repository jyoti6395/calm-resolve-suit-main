import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "super_admin" | "technician" | string;
  status: "active" | "inactive" | string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    clearAuthSession(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setAuthError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setAuthUser, clearAuthSession, setAuthLoading, setAuthError } = authSlice.actions;

/**
 * Persistent Worker Listener (Redux Thunk)
 * Invokes the Firebase Web SDK `onAuthStateChanged` hook listener loop.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initializeAuthListener = () => (dispatch: any) => {
  dispatch(setAuthLoading(true));

  const unsubscribe = onAuthStateChanged(
    auth,
    async (firebaseUser) => {
      // 1. Unauthenticated Session
      if (!firebaseUser) {
        dispatch(clearAuthSession());
        return;
      }

      // 2. Authenticated Firebase Session - Fetch Role Profile Metadata
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          throw new Error("User profile metadata not found in the database.");
        }

        const profileData = userDocSnap.data();

        // 3. Security Rejection Fence
        if (profileData.status === "inactive") {
          await signOut(auth);
          throw new Error("This account is inactive. Please contact your administrator.");
        }

        // 4. Sanitize and consolidate payload
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || profileData.fullName || null,
          role: profileData.role || "technician",
          status: profileData.status || "active",
        };

        // 5. Dispatch synchronized local state
        dispatch(setAuthUser(authUser));
      } catch (err: unknown) {
        // Enforce defensive error boundary block
        const error = err as Error;
        console.error("Auth Initialization Error:", error);
        dispatch(setAuthError(error.message || "Failed to initialize active user session."));
        dispatch(clearAuthSession());
      }
    },
    (error) => {
      // Catch socket/network stream drops from Firebase directly
      console.error("onAuthStateChanged stream error:", error);
      dispatch(setAuthError(error.message));
      dispatch(clearAuthSession());
    },
  );

  return unsubscribe;
};

export default authSlice.reducer;
