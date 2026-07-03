import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/layout/MobileShell";
import { Field } from "@/components/ui/field";
import { ChevronLeft, Lock, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { confirmPasswordReset } from "@/services/authService";

export function NewPasswordForm() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);

  useEffect(() => {
    // Extract the oobCode from the URL search parameters when the component mounts
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("oobCode");
    if (code) {
      setOobCode(code);
    } else {
      setError("Invalid or missing password reset code.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!oobCode) {
      setError("Cannot reset password without a valid reset code.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(oobCode, password);
      setSuccess(true);
      setTimeout(() => {
        nav({ to: "/login" }); // Redirect to login after success
      }, 3000);
    } catch (err) {
      console.error("Password reset error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to reset password. The link might be expired.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileShell>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="px-5 pt-[env(safe-area-inset-top)] pt-4">
          <Link
            to="/login"
            className="h-10 w-10 -ml-2 rounded-full hover:bg-muted flex items-center justify-center"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </div>
        <div className="px-6 pt-2">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-5 text-[28px] font-extrabold tracking-tight">Set a new password</h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Choose a strong password you haven't used before.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 mt-8 space-y-3">
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 mb-4 rounded-xl bg-success/10 border border-success/20 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <p className="text-sm text-success">
                Password reset successfully! Redirecting to login...
              </p>
            </div>
          )}

          <Field
            icon={Lock}
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            disabled={loading || success}
            required
          />
          <Field
            icon={Lock}
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
            disabled={loading || success}
            required
          />

          {!success && (
            <>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <span
                  className={`h-1 rounded-full ${password.length > 0 ? "bg-success" : "bg-muted"}`}
                />
                <span
                  className={`h-1 rounded-full ${password.length > 5 ? "bg-success" : "bg-muted"}`}
                />
                <span
                  className={`h-1 rounded-full ${password.length > 8 ? "bg-success" : "bg-muted"}`}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {password.length === 0
                  ? "Enter a password"
                  : password.length < 6
                    ? "Too short"
                    : "Strength: Good"}
              </p>
            </>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="h-14 w-full mt-4 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </MobileShell>
  );
}
