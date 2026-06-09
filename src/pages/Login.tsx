import { Link, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { MobileShell } from "../components/MobileShell";
import { Logo } from "../components/Logo";
import { Mail, Lock, Eye, EyeOff, ChevronLeft, AlertCircle, Loader2 } from "lucide-react";
import { logIn } from "../services/authService";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await logIn(email.trim(), password);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      console.error("Login error:", err);
      // User-friendly error message mapping
      switch (err.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Invalid email or password. Please try again.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/too-many-requests":
          setError("Too many failed login attempts. Please try again later.");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled. Contact support.");
          break;
        default:
          setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileShell>
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <div>
          {/* Header Back Button */}
          <div className="px-5 pt-[calc(env(safe-area-inset-top)+28px)] pt-4">
            <Link to="/onboarding" className="h-10 w-10 -ml-2 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </div>

          {/* Title & Introduction */}
          <div className="px-6 pt-2 flex flex-col items-center text-center">
            <Logo size={48} />
            <h1 className="mt-6 text-[30px] font-extrabold tracking-tight text-balance">
              Welcome back
            </h1>
            <p className="mt-1.5 text-[14px] text-muted-foreground">
                Sign in to continue to AdviseTech.
            </p>

          </div>
          {/* Error Banner */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-[13px] font-medium rounded-2xl flex items-start gap-2.5 animate-slide-up">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 mt-8 space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">Email Address</label>
              <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  disabled={loading}
                  className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">Password</label>
              <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all">
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  disabled={loading}
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-[13px]">
                <span className="text-foreground/85 font-medium">Keep secure session</span>
              </div>
              <Link to="/forgot-password" className="text-[13px] font-semibold text-primary hover:underline">Forgot password?</Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 h-14 w-full rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated hover:shadow-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>
        </div>

        {/* Create Account Link */}
        <div className="px-6 pb-8 pt-6 text-center text-[13px] text-muted-foreground">
          New to AdviseTech?{" "}
          <Link to="/signup" className="text-primary font-semibold hover:underline">Create account</Link>
          <p className="mt-4 text-[11px] text-muted-foreground/70">
            By continuing you agree to our <span className="underline cursor-pointer hover:text-foreground">Terms</span> & <span className="underline cursor-pointer hover:text-foreground">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </MobileShell>
  );
}
