import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MobileShell } from "@/components/MobileShell";
import { ChevronLeft, Mail, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { sendPasswordReset } from "../services/authService";
import { toast } from "sonner";
import React, { forwardRef } from "react";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email address." })
    .email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<{ className?: string }>;
  trailing?: React.ReactNode;
}

const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ icon: Icon, trailing, ...props }, ref) => {
    return (
      <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
        <input
          ref={ref}
          {...props}
          className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
        />
        {trailing}
      </div>
    );
  },
);

Field.displayName = "Field";

export const Route = createFileRoute("/forgot-password")({ component: Forgot });

function Forgot() {
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
