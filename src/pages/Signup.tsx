import { Link, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { MobileShell } from "../components/MobileShell";
import { ChevronLeft, Mail, Lock, User, Building2, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { signUp } from "../services/authService";

export function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName || !company || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await signUp(email.trim(), password, {
        fullName: fullName.trim(),
        company: company.trim()
      });
      // Redirect to dashboard
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      console.error("Signup error:", err);
      // User-friendly error message mapping
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered. Please sign in instead.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/operation-not-allowed":
          setError("Email/Password accounts are currently disabled.");
          break;
        case "auth/weak-password":
          setError("The password is too weak. Please choose a stronger password.");
          break;
        default:
          setError(err.message || "Registration failed. Please try again.");
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
          <div className="px-5 pt-[calc(env(safe-area-inset-top)+28px)]">
            <Link
              to="/login"
              className="h-10 w-10 -ml-2 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </div>

          {/* Title & Subtitle */}
          <div className="px-6 text-center pt-2">
            <h1 className="text-[30px] font-extrabold tracking-tight text-balance">Create your account</h1>
            <p className="mt-1.5 text-[14px] text-muted-foreground">Onboard in less than a minute.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-[13px] font-medium rounded-2xl flex items-start gap-2.5 animate-slide-up">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 mt-6 space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">Full Name</label>
              <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Petrov"
                  disabled={loading}
                  className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">Company</label>
              <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  disabled={loading}
                  className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">Work Email</label>
              <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@acme.co"
                  disabled={loading}
                  className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">Password</label>
              <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all">
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  disabled={loading}
                  className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">Confirm Password</label>
              <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all">
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  disabled={loading}
                  className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground/80 px-1 pt-1">
              By creating an account, you agree to AdviseTech's <span className="underline text-foreground/75 cursor-pointer hover:text-foreground">Terms of Service</span> and <span className="underline text-foreground/75 cursor-pointer hover:text-foreground">Privacy Policy</span>.
            </p>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-14 w-full rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated hover:shadow-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create account</span>
              )}
            </button>
          </form>
        </div>

        {/* Existing Account Link */}
        <div className="px-6 pb-8 pt-6 text-center text-[13px] text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </div>
      </div>
    </MobileShell>
  );
}
