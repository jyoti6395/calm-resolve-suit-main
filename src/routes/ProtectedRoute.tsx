import { ReactNode, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { MobileShell } from "../components/MobileShell";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute wraps page routes to enforce that the user:
 * 1. Is fully authenticated (not null).
 * 2. Has the role of "customer" in Firestore.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If auth state resolved and user is not logged in, redirect to login
    if (!loading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, loading, navigate]);

  // Loading spinner shown during state resolution
  if (loading) {
    return (
      <MobileShell>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-[14px] text-muted-foreground font-medium">Verifying access...</p>
        </div>
      </MobileShell>
    );
  }

  // Prevent flicker during redirect
  if (!isAuthenticated) {
    return null;
  }

  // Role checking: Only "customer" role is allowed
  if (role !== "customer") {
    return (
      <MobileShell>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-xl font-bold text-foreground">Access Restricted</h1>
          <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed max-w-[280px]">
            This account does not have customer privileges. Access to the support suite is blocked.
          </p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="mt-6 px-5 py-2.5 rounded-xl bg-secondary hover:bg-muted text-foreground text-[13px] font-semibold transition-colors"
          >
            Back to login
          </button>
        </div>
      </MobileShell>
    );
  }

  return <>{children}</>;
}
