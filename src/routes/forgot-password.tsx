import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Field } from "./login";
import { ChevronLeft, Mail } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({ component: Forgot });

function Forgot() {
  const nav = useNavigate();
  return (
    <MobileShell>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="px-5 pt-[env(safe-area-inset-top)] pt-4">
          <Link to="/login" className="h-10 w-10 -ml-2 rounded-full hover:bg-muted flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </div>
        <div className="px-6 pt-2">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-5 text-[28px] font-extrabold tracking-tight">Forgot password?</h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground max-w-[320px]">
            Enter the email associated with your account and we'll send a verification code.
          </p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); nav({ to: "/otp" }); }} className="px-6 mt-8 space-y-3">
          <Field icon={Mail} type="email" placeholder="Work email" />
          <button className="h-14 w-full rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated">Send code</button>
        </form>
      </div>
    </MobileShell>
  );
}
