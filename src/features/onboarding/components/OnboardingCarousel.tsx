import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/layout/MobileShell";
import { Activity, MessagesSquare, Paperclip, BarChart3, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const slides = [
  {
    icon: Activity,
    title: "Real-time ticket tracking",
    body: "Watch every ticket move through your team — from raise to resolve — with live status, SLA timers, and instant updates.",
    tint: "from-[oklch(0.6_0.22_263)] to-[oklch(0.45_0.2_263)]",
  },
  {
    icon: MessagesSquare,
    title: "Talk to your technician",
    body: "Direct, encrypted chat with the engineer on your case. Voice notes, read receipts, and typing indicators included.",
    tint: "from-[oklch(0.62_0.16_200)] to-[oklch(0.45_0.18_240)]",
  },
  {
    icon: Paperclip,
    title: "Attach anything",
    body: "Screenshots, logs, screen recordings, even annotated diagrams — drag, drop, and AI does the triage.",
    tint: "from-[oklch(0.7_0.16_160)] to-[oklch(0.5_0.18_200)]",
  },
  {
    icon: BarChart3,
    title: "Insights that matter",
    body: "Executive-grade analytics on resolution time, SLA compliance, and team performance — at a glance.",
    tint: "from-[oklch(0.65_0.2_300)] to-[oklch(0.45_0.2_263)]",
  },
];

export function OnboardingCarousel() {
  const nav = useNavigate();
  const isMobile = useIsMobile();

  // ─── DESKTOP BYPASS ───────────────────────────────────────────────────────
  // Onboarding is a mobile-only experience.
  // Desktop users are sent directly to /login without rendering the carousel.
  useEffect(() => {
    if (!isMobile) {
      nav({ to: "/login", replace: true });
    }
  }, [isMobile, nav]);

  // Prevent any flicker on desktop while redirect fires
  if (!isMobile) return null;

  // ─── MOBILE PATH ─────────────────────────────────────────────────────────
  // Everything below is UNCHANGED — the exact original OnboardingCarousel code.
  return <OnboardingCarouselContent nav={nav} />;
}

// Extracted into sub-component so the desktop early-return above is clean
function OnboardingCarouselContent({ nav }: { nav: ReturnType<typeof useNavigate> }) {
  const [i, setI] = useState(0);
  const s = slides[i];
  const Icon = s.icon;
  const last = i === slides.length - 1;

  const next = () => (last ? nav({ to: "/login" }) : setI(i + 1));

  return (
    <MobileShell>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="px-5 pt-[calc(env(safe-area-inset-top,0px)+28px)] flex justify-between items-center">
          <div className="flex gap-1.5">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/25"}`}
              />
            ))}
          </div>
          <button
            onClick={() => nav({ to: "/login" })}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
        </div>

        <div className="flex-1 px-6 flex flex-col items-center justify-center text-center" key={i}>
          <div
            className={`relative h-64 w-64 rounded-[2rem] bg-gradient-to-br ${s.tint} shadow-elevated flex items-center justify-center animate-scale-in overflow-hidden`}
          >
            <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -bottom-10 -left-6 h-36 w-36 rounded-full bg-black/15 blur-2xl" />
            {/* layered cards illustration */}
            <div className="absolute inset-6 rounded-2xl glass-dark flex items-center justify-center">
              <Icon className="h-20 w-20 text-white" strokeWidth={1.5} />
            </div>
            <div className="absolute top-6 left-6 right-16 h-10 rounded-xl glass-dark" />
            <div className="absolute bottom-6 left-16 right-6 h-10 rounded-xl glass-dark" />
          </div>

          <h2 className="mt-10 text-[28px] font-extrabold tracking-tight text-foreground text-balance animate-slide-up">
            {s.title}
          </h2>
          <p
            className="mt-3 text-[15px] text-muted-foreground leading-relaxed max-w-[320px] text-balance animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            {s.body}
          </p>
        </div>

        <div className="px-6 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] pt-4 flex flex-col items-center gap-3">
          <button
            onClick={next}
            className="w-full h-12 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated flex items-center justify-center gap-2 hover:shadow-glow transition-all"
          >
            {last ? "Get started" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
