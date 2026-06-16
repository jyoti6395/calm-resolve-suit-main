import { Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/layout/MobileShell";
import { Field } from "@/components/ui/field";
import { ChevronLeft, Lock, ShieldCheck } from "lucide-react";

export function NewPasswordForm() {
  const nav = useNavigate();
  return (
    <MobileShell>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="px-5 pt-[env(safe-area-inset-top)] pt-4">
          <Link
            to="/otp"
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            nav({ to: "/dashboard" });
          }}
          className="px-6 mt-8 space-y-3"
        >
          <Field icon={Lock} type="password" placeholder="New password" />
          <Field icon={Lock} type="password" placeholder="Confirm new password" />
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <span className="h-1 rounded-full bg-success" />
            <span className="h-1 rounded-full bg-success" />
            <span className="h-1 rounded-full bg-muted" />
          </div>
          <p className="text-[11px] text-muted-foreground">Strength: Strong</p>
          <button className="h-14 w-full rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated">
            Update password
          </button>
        </form>
      </div>
    </MobileShell>
  );
}
