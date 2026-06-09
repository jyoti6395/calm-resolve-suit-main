import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Field } from "./login";
import { ChevronLeft, Mail, Lock, User, Building2 } from "lucide-react";

export const Route = createFileRoute("/signup")({ component: Signup });

function Signup() {
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
          <h1 className="text-[30px] font-extrabold tracking-tight text-balance">Create your account</h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">Onboard in less than a minute.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); nav({ to: "/otp" }); }} className="px-6 mt-8 space-y-3">
          <Field icon={User} placeholder="Full name" />
          <Field icon={Building2} placeholder="Company" />
          <Field icon={Mail} type="email" placeholder="Work email" />
          <Field icon={Lock} type="password" placeholder="Password (min 8 chars)" />

          <p className="text-[11px] text-muted-foreground/80 px-1 pt-2">
            By creating an account, you agree to AdviseTech's <span className="underline text-foreground/70">Terms of Service</span> and <span className="underline text-foreground/70">Privacy Policy</span>.
          </p>

          <button type="submit" className="mt-2 h-14 w-full rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated">
            Create account
          </button>
        </form>

        <p className="mt-auto px-6 pb-8 pt-6 text-center text-[13px] text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary font-semibold">Sign in</Link>
        </p>
      </div>
    </MobileShell>
  );
}
