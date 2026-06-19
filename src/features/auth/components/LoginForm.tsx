import { Link, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { Logo } from "@/components/layout/Logo";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  AlertCircle,
  Loader2,
  Activity,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";
import { logIn } from "@/services/authService";
import { useAppSelector } from "@/store/hooks";
import { useIsMobile } from "@/hooks/use-mobile";

// ─── Shared form logic hook ────────────────────────────────────────────────
function useLoginForm() {
  const navigate = useNavigate();
  const { error: authError } = useAppSelector((state) => state.auth);
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
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error("Login error:", err);
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    authError,
    loading,
    showPassword,
    setShowPassword,
    handleSubmit,
  };
}

export function LoginPage() {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <DesktopLoginPage />;
  }

  // ─── MOBILE PATH — completely unchanged ───────────────────────────────────
  return <MobileLoginPage />;
}

// ─── MOBILE LOGIN (original code, zero modifications) ────────────────────────
function MobileLoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    authError,
    loading,
    showPassword,
    setShowPassword,
    handleSubmit,
  } = useLoginForm();

  return (
    <MobileShell>
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <div>
          {/* Header Back Button */}
          <div className="px-5 pt-[calc(env(safe-area-inset-top)+28px)] pt-4">
            <Link
              to="/onboarding"
              className="h-10 w-10 -ml-2 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            >
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
          {(error || authError) && (
            <div className="mx-6 mt-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-[13px] font-medium rounded-2xl flex items-start gap-2.5 animate-slide-up">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error || authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 mt-8 space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
                Email Address
              </label>
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
              <label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
                Password
              </label>
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
              <Link
                to="/forgot-password"
                className="text-[13px] font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
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
          <Link to="/signup" className="text-primary font-semibold hover:underline">
            Create account
          </Link>
          <p className="mt-4 text-[11px] text-muted-foreground/70">
            By continuing you agree to our{" "}
            <span className="underline cursor-pointer hover:text-foreground">Terms</span> &{" "}
            <span className="underline cursor-pointer hover:text-foreground">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </MobileShell>
  );
}

// ─── DESKTOP LOGIN (split-screen layout) ──────────────────────────────────────
function DesktopLoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    authError,
    loading,
    showPassword,
    setShowPassword,
    handleSubmit,
  } = useLoginForm();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* ── LEFT PANEL — Branding ── */}
      <div className="hidden lg:flex w-1/2 flex-col bg-gradient-hero text-white relative overflow-hidden shrink-0">
        {/* Background orbs */}
        <div className="absolute -top-24 -left-16 h-96 w-96 rounded-full bg-primary-glow/30 blur-3xl animate-float-orb pointer-events-none" />
        <div
          className="absolute bottom-0 -right-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl animate-float-orb pointer-events-none"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute inset-0 bg-gradient-mesh opacity-40 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo + wordmark */}
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <span className="text-[20px] font-bold tracking-tight">AdviseTech</span>
          </div>

          {/* Hero text */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-[36px] font-extrabold leading-tight tracking-tight text-balance">
              Secure IT Support &<br />
              Ticket Management
            </h2>
            <p className="mt-4 text-[15px] text-white/70 leading-relaxed max-w-[360px]">
              Manage every support request from raise to resolution — with real-time updates,
              encrypted chat, and SLA tracking built in.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-4">
              {[
                { icon: Activity, text: "Real-time ticket status & SLA timers" },
                { icon: MessagesSquare, text: "Encrypted chat with your technician" },
                { icon: ShieldCheck, text: "SOC 2 Type II · ISO 27001 certified" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-[14px] text-white/85 font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom badges */}
          <div className="flex items-center gap-2 text-[11px] text-white/50">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>SOC 2 Type II · ISO 27001 · End-to-end encrypted</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex items-center justify-center bg-background px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-[420px]">
          {/* Logo (small — visible only when left panel is hidden on md screens) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Logo size={32} />
            <span className="text-[16px] font-bold">AdviseTech</span>
          </div>

          <h1 className="text-[30px] font-extrabold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Sign in to continue to AdviseTech.
          </p>

          {/* Error Banner */}
          {(error || authError) && (
            <div className="mt-5 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-[13px] font-medium rounded-2xl flex items-start gap-2.5 animate-slide-up">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error || authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
                Email Address
              </label>
              <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="email"
                  id="desktop-login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  disabled={loading}
                  className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
                Password
              </label>
              <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all">
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="desktop-login-password"
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

            {/* Forgot password */}
            <div className="flex justify-end pt-1">
              <Link
                to="/forgot-password"
                className="text-[13px] font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="desktop-login-submit"
              disabled={loading}
              className="mt-2 h-14 w-full rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated hover:shadow-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:pointer-events-none"
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

          {/* Create account */}
          <p className="mt-8 text-center text-[13px] text-muted-foreground">
            New to AdviseTech?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create account
            </Link>
          </p>
          <p className="mt-3 text-center text-[11px] text-muted-foreground/70">
            By continuing you agree to our{" "}
            <span className="underline cursor-pointer hover:text-foreground">Terms</span> &{" "}
            <span className="underline cursor-pointer hover:text-foreground">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
