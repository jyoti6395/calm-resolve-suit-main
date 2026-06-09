import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { CheckCircle2, Share2, ArrowRight, Clock, UserCircle2 } from "lucide-react";

export const Route = createFileRoute("/tickets/confirmation")({ component: Confirmation });

function Confirmation() {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 200); return () => clearTimeout(t); }, []);

  return (
    <MobileShell>
      <div className="min-h-screen bg-background flex flex-col items-center px-6 pt-[15vh] pb-10">
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-success/30 animate-pulse-ring" />
          <span className="absolute inset-0 rounded-full bg-success/20 animate-pulse-ring" style={{ animationDelay: "0.4s" }} />
          <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-success to-[oklch(0.55_0.18_155)] flex items-center justify-center shadow-elevated animate-scale-in">
            <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="mt-8 text-[28px] font-extrabold tracking-tight text-center text-balance animate-slide-up">
          Ticket raised successfully
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground text-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
          Your request is in good hands. We'll keep you posted.
        </p>

        {show && (
          <div className="mt-8 w-full rounded-3xl bg-card border border-border p-5 shadow-soft animate-slide-up">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ticket ID</span>
              <button className="text-primary"><Share2 className="h-4 w-4" /></button>
            </div>
            <p className="mt-1 text-[22px] font-extrabold tracking-tight">AT-2842</p>

            <div className="mt-5 space-y-3">
              <Info icon={UserCircle2} label="Assigned technician" value="Priya Nair · Network Lead" />
              <Info icon={Clock} label="Estimated resolution" value="Within 4 hours" />
            </div>
          </div>
        )}

        <div className="mt-auto w-full space-y-3 pt-10">
          <Link to="/tickets/$id" params={{ id: "AT-2841" }} className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated">
            View ticket <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/dashboard" className="block text-center h-14 leading-[3.5rem] rounded-2xl bg-secondary font-semibold">
            Back to dashboard
          </Link>
        </div>
      </div>
    </MobileShell>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-[13px] font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}
