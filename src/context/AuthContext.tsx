import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { getUserProfile, UserProfile } from "../services/authService";

export interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  role: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Listen to Firebase authentication status changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        try {
          // Fetch complete user profile from Firestore
          const userProfile = await getUserProfile(currentUser.uid);
          setProfile(userProfile);
          setRole(userProfile?.role || null);
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          setProfile(null);
          setRole(null);
        }
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      try {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
        setRole(userProfile?.role || null);
      } catch (error) {
        console.error("Error refreshing user profile from Firestore:", error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    role,
    loading,
    isAuthenticated: !!user,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
