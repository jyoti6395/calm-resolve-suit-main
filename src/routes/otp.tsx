import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ChevronLeft, KeyRound } from "lucide-react";

export const Route = createFileRoute("/otp")({ component: Otp });

function Otp() {
  const nav = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const set = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = ch;
    setCode(next);
    if (ch && i < 5) refs.current[i + 1]?.focus();
  };

  const filled = code.every(Boolean);

  return (
    <MobileShell>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="px-5 pt-[env(safe-area-inset-top)] pt-4">
          <Link to="/forgot-password" className="h-10 w-10 -ml-2 rounded-full hover:bg-muted flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </div>
        <div className="px-6 pt-2">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-5 text-[28px] font-extrabold tracking-tight">Verify it's you</h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            We sent a 6-digit code to <span className="text-foreground font-semibold">alex@acme.co</span>
          </p>
        </div>

        <div className="px-6 mt-8 flex justify-between gap-2">
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={c}
              onChange={(e) => set(i, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Backspace" && !c && i > 0) refs.current[i - 1]?.focus(); }}
              inputMode="numeric"
              maxLength={1}
              className={`h-14 w-12 rounded-2xl text-center text-xl font-bold outline-none transition-all ${c ? "bg-primary/8 border-2 border-primary text-foreground" : "bg-secondary border-2 border-transparent"}`}
            />
          ))}
        </div>

        <button
          onClick={() => nav({ to: "/reset-password" })}
          disabled={!filled}
          className="mx-6 mt-8 h-14 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated disabled:opacity-40 disabled:shadow-none"
        >
          Verify
        </button>

        <p className="mt-6 text-center text-[13px] text-muted-foreground">
          Didn't get a code? <button className="text-primary font-semibold">Resend in 0:42</button>
        </p>
      </div>
    </MobileShell>
  );
}
