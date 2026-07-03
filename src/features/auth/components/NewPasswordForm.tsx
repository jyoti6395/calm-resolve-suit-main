import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/layout/MobileShell";
import { CheckCircle2 } from "lucide-react";

export function NewPasswordForm() {
  const nav = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      nav({ to: "/login" });
    }, 3000);
    return () => clearTimeout(timer);
  }, [nav]);

  return (
    <MobileShell>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md mx-auto text-center space-y-6">
          <div className="inline-flex h-20 w-20 rounded-full bg-success/10 items-center justify-center animate-bounce">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground animate-fade-in">
              Password Reset Successfully!
            </h1>
            <p className="text-sm text-muted-foreground">
              Your password has been successfully updated. Redirecting to the login screen...
            </p>
          </div>
          <div className="flex justify-center pt-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
