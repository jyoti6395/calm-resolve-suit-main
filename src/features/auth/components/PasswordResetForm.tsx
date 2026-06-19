import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MobileShell } from "@/components/layout/MobileShell";
import { Logo } from "@/components/layout/Logo";
import { ChevronLeft, Mail, AlertCircle, Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { sendPasswordReset } from "@/services/authService";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/schemas/authSchema";
import { Field } from "@/components/ui/field";
import { useIsMobile } from "@/hooks/use-mobile";

export function PasswordResetForm() {
  const isMobile = useIsMobile();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setError(null);
    try {
      await sendPasswordReset(data.email);
      setIsSuccess(true);
      toast.success("Request processed successfully.");
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error("Password reset error:", err);

      if (err.code === "auth/user-not-found") {
        // Treat user not found as success to protect user privacy (prevent enumeration)
        setIsSuccess(true);
        toast.success("Request processed successfully.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many password reset requests. Please try again later.");
      } else {
        setError("An error occurred while processing your request. Please try again.");
      }
    }
  };

  // ─── DESKTOP LAYOUT ────────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        {/* Left panel — branding */}
        <div className="hidden lg:flex w-1/2 flex-col bg-gradient-hero text-white relative overflow-hidden shrink-0">
          <div className="absolute -top-24 -left-16 h-96 w-96 rounded-full bg-primary-glow/30 blur-3xl animate-float-orb pointer-events-none" />
          <div
            className="absolute bottom-0 -right-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl animate-float-orb pointer-events-none"
            style={{ animationDelay: "2s" }}
          />
          <div className="absolute inset-0 bg-gradient-mesh opacity-40 pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full px-12 py-10">
            <div className="flex items-center gap-3">
              <Logo size={40} />
              <span className="text-[20px] font-bold tracking-tight">AdviseTech</span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-[34px] font-extrabold leading-tight tracking-tight text-balance">
                Account recovery
                <br />
                made simple.
              </h2>
              <p className="mt-4 text-[15px] text-white/70 leading-relaxed max-w-[340px]">
                We'll send a secure reset link to your registered email address. The link expires in
                1 hour.
              </p>

              <div className="mt-10 flex items-center gap-2 text-[13px] text-white/60">
                <ShieldCheck className="h-4 w-4 text-white/60 shrink-0" />
                <span>Reset links are encrypted and expire automatically</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-white/50">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>SOC 2 Type II · ISO 27001 · End-to-end encrypted</span>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-center justify-center bg-background px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-[400px]">
            {/* Back link */}
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to sign in
            </Link>

            {isSuccess ? (
              /* Success state */
              <div className="flex flex-col items-center text-center animate-slide-up">
                <div className="h-16 w-16 rounded-2xl bg-success/15 flex items-center justify-center shadow-soft">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <h1 className="mt-6 text-[28px] font-extrabold tracking-tight">Check your email</h1>
                <p className="mt-3 text-[14px] text-muted-foreground leading-relaxed max-w-[320px]">
                  If a matching account exists, a password reset link has been sent to your email.
                  Please check your inbox.
                </p>
                <Link
                  to="/login"
                  className="mt-6 h-12 w-full max-w-[320px] rounded-2xl bg-secondary text-foreground font-semibold flex items-center justify-center transition-all hover:bg-muted"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Mail className="h-6 w-6 text-primary" />
                </div>

                <h1 className="text-[30px] font-extrabold tracking-tight text-foreground">
                  Forgot password?
                </h1>
                <p className="mt-1.5 text-[14px] text-muted-foreground">
                  Enter your email and we'll send a reset link.
                </p>

                {error && (
                  <div className="mt-5 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-[13px] font-medium rounded-2xl flex items-start gap-2.5 animate-slide-up">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/80">
                        Email Address
                      </label>
                      {errors.email && (
                        <span className="text-[11px] text-destructive font-semibold">
                          {errors.email.message}
                        </span>
                      )}
                    </div>
                    <Field
                      icon={Mail}
                      type="email"
                      id="desktop-forgot-email"
                      placeholder="name@company.com"
                      disabled={isSubmitting}
                      {...register("email")}
                    />
                  </div>

                  <button
                    type="submit"
                    id="desktop-forgot-submit"
                    disabled={isSubmitting}
                    className="mt-2 h-14 w-full rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated hover:shadow-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Send reset link</span>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-[13px] text-muted-foreground">
                  Remember your password?{" "}
                  <Link to="/login" className="text-primary font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── MOBILE LAYOUT — completely unchanged ─────────────────────────────────
  return (
    <MobileShell>
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <div>
          {/* Header Back Button */}
          <div className="px-5 pt-[calc(env(safe-area-inset-top)+28px)] pt-4">
            <Link
              to="/login"
              disabled={isSubmitting}
              className="h-10 w-10 -ml-2 rounded-full hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </div>

          {isSuccess ? (
            /* Success Screen State */
            <div className="px-6 pt-12 flex flex-col items-center text-center animate-slide-up">
              <div className="h-16 w-16 rounded-2xl bg-success/15 flex items-center justify-center shadow-soft">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h1 className="mt-6 text-[28px] font-extrabold tracking-tight">Check your email</h1>
              <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed max-w-[320px]">
                If a matching account exists, a password reset link has been sent to your email.
                Please check your inbox.
              </p>
              <Link
                to="/login"
                className="mt-6 h-14 w-full max-w-[320px] rounded-2xl bg-secondary text-foreground font-semibold flex items-center justify-center transition-all hover:bg-muted active:scale-[0.98]"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            /* Form Screen State */
            <>
              <div className="px-6 pt-2 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h1 className="mt-5 text-[28px] font-extrabold tracking-tight">Forgot password?</h1>
                <p className="mt-1.5 text-[14px] text-muted-foreground max-w-[320px]">
                  Enter the email associated with your account and we'll send a password reset link.
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
              <form onSubmit={handleSubmit(onSubmit)} className="px-6 mt-8 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      Email Address
                    </label>
                    {errors.email && (
                      <span className="text-[11px] text-destructive font-semibold">
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                  <Field
                    icon={Mail}
                    type="email"
                    placeholder="name@company.com"
                    disabled={isSubmitting}
                    {...register("email")}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 h-14 w-full rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated hover:shadow-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Bottom Helper Footer */}
        {!isSuccess && (
          <div className="px-6 pb-8 pt-6 text-center text-[13px] text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
