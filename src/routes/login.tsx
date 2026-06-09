import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { Logo } from "@/components/Logo";
import { Mail, Lock, Eye, EyeOff, Fingerprint, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);

  return (
    <MobileShell>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="px-5 pt-[env(safe-area-inset-top)] pt-4">
          <Link to="/onboarding" className="h-10 w-10 -ml-2 rounded-full hover:bg-muted flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="px-6 pt-2">
          <Logo size={56} />
          <h1 className="mt-6 text-[30px] font-extrabold tracking-tight text-balance">Welcome back</h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">Sign in to continue to AdviseTech.</p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); nav({ to: "/dashboard" }); }}
          className="px-6 mt-8 space-y-3"
        >
          <Field icon={Mail} type="email" placeholder="Work email" defaultValue="alex@acme.co" />
          <Field
            icon={Lock}
            type={show ? "text" : "password"}
            placeholder="Password"
            defaultValue="••••••••"
            trailing={
              <button type="button" onClick={() => setShow(!show)} className="text-muted-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={() => setRemember(!remember)} className="flex items-center gap-2 text-[13px]">
              <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${remember ? "bg-primary" : "bg-muted"}`}>
                <span className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${remember ? "translate-x-4" : ""}`} />
              </span>
              <span className="text-foreground/80 font-medium">Remember me</span>
            </button>
            <Link to="/forgot-password" className="text-[13px] font-semibold text-primary">Forgot password?</Link>
          </div>

          <button type="submit" className="mt-4 h-14 w-full rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated hover:shadow-glow transition-all">
            Sign in
          </button>

          <button type="button" onClick={() => nav({ to: "/dashboard" })} className="w-full h-14 rounded-2xl border border-border bg-card flex items-center justify-center gap-2 font-semibold">
            <Fingerprint className="h-5 w-5 text-primary" />
            Sign in with Face ID
          </button>

          <Divider />

          <div className="grid grid-cols-2 gap-3">
            <SsoButton provider="Google" />
            <SsoButton provider="Microsoft" />
          </div>
        </form>

        <div className="mt-auto px-6 pb-8 pt-6 text-center text-[13px] text-muted-foreground">
          New to AdviseTech?{" "}
          <Link to="/signup" className="text-primary font-semibold">Create account</Link>
          <p className="mt-4 text-[11px] text-muted-foreground/70">
            By continuing you agree to our <span className="underline">Terms</span> & <span className="underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </MobileShell>
  );
}

export function Field({ icon: Icon, trailing, ...props }: any) {
  return (
    <label className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card transition-all">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <input
        {...props}
        className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground/70"
      />
      {trailing}
    </label>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-2 text-[11px] text-muted-foreground uppercase tracking-wider">
      <div className="flex-1 h-px bg-border" />
      or continue with
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function SsoButton({ provider }: { provider: "Google" | "Microsoft" }) {
  return (
    <button type="button" className="h-12 rounded-2xl border border-border bg-card flex items-center justify-center gap-2 font-medium text-[13px] hover:bg-muted/50 transition-colors">
      {provider === "Google" ? <GoogleIcon /> : <MsIcon />}
      {provider}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
  );
}
function MsIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>
  );
}
