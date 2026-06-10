import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { Logo } from "@/components/Logo";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AdviseTech — Secure IT Support" },
      {
        name: "description",
        content: "Enterprise IT support & ticket management with real-time chat and analytics.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const nav = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 4)), 60);
    const go = setTimeout(() => nav({ to: "/onboarding" }), 2400);
    return () => {
      clearInterval(t);
      clearTimeout(go);
    };
  }, [nav]);

  return (
    <MobileShell>
      <div className="relative min-h-screen bg-gradient-hero overflow-hidden flex flex-col items-center justify-center text-white pt-[calc(env(safe-area-inset-top,0px)+2rem)] pb-[calc(env(safe-area-inset-bottom,0px)+2rem)]">
        {/* Floating orbs */}
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-primary-glow/40 blur-3xl animate-float-orb" />
        <div
          className="absolute bottom-0 -right-20 h-80 w-80 rounded-full bg-primary/40 blur-3xl animate-float-orb"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute inset-0 bg-gradient-mesh opacity-60" />

        {/* Orbiting ring */}
        <div className="relative animate-scale-in">
          <div className="absolute inset-0 -m-12 rounded-full border border-white/10 animate-orbit" />
          <div
            className="absolute inset-0 -m-20 rounded-full border border-white/5 animate-orbit"
            style={{ animationDirection: "reverse", animationDuration: "20s" }}
          />
          <Logo size={120} animated />
        </div>

        <div
          className="relative mt-12 text-center px-8 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <h1 className="text-4xl font-extrabold tracking-tight">AdviseTech</h1>
          <p className="mt-3 text-sm text-white/70 max-w-[300px] mx-auto text-balance leading-relaxed">
            Secure IT Support & Ticket Management
          </p>
        </div>

        <div
          className="absolute bottom-16 left-0 right-0 px-10 animate-slide-up"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-white/60 to-white rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-white/60">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>SOC 2 Type II · ISO 27001 · End-to-end encrypted</span>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
