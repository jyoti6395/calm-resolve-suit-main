import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { MobileShell } from "@/components/MobileShell";
import { CheckCircle2, Share2, ArrowRight, Clock, UserCircle2, Loader2 } from "lucide-react";
import { Ticket } from "@/types/store";
import { SLA_HOURS_MAP } from "@/constants/ticket";
import { z } from "zod";

const confirmationSearchSchema = z.object({
  ticketId: z.string().optional(),
  ticketSequenceId: z.string().optional(),
});

export const Route = createFileRoute("/tickets/confirmation")({
  validateSearch: (search) => confirmationSearchSchema.parse(search),
  component: Confirmation,
});

function Confirmation() {
  const { ticketId, ticketSequenceId } = Route.useSearch();
  const [show, setShow] = useState(false);
  const [ticketData, setTicketData] = useState<Ticket | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ticketId) return;

    const unsubscribe = onSnapshot(
      doc(db, "tickets", ticketId),
      (snapshot) => {
        if (snapshot.exists()) {
          setTicketData({ id: snapshot.id, ...snapshot.data() } as Ticket);
        }
      },
      (error) => {
        console.error("Error fetching confirmed ticket details:", error);
      },
    );

    return () => unsubscribe();
  }, [ticketId]);

  const getEstimatedResolution = (priority?: string): string => {
    if (!priority) return "Under 48 hours";
    const hours = SLA_HOURS_MAP[priority.toLowerCase()] || 48;
    return `Within ${hours} hour${hours > 1 ? "s" : ""}`;
  };

  const currentSequenceId = ticketData?.ticketSequenceId || ticketSequenceId || "TK-XXXX";
  const priority = ticketData?.priority || "medium";
  const assignedName = ticketData?.assignedToName;

  return (
    <MobileShell>
      <div className="min-h-screen bg-background flex flex-col items-center px-6 pt-[15vh] pb-10">
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-success/30 animate-pulse-ring" />
          <span
            className="absolute inset-0 rounded-full bg-success/20 animate-pulse-ring"
            style={{ animationDelay: "0.4s" }}
          />
          <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-success to-[oklch(0.55_0.18_155)] flex items-center justify-center shadow-elevated animate-scale-in">
            <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="mt-8 text-[28px] font-extrabold tracking-tight text-center text-balance animate-slide-up">
          Ticket raised successfully
        </h1>
        <p
          className="mt-2 text-[14px] text-muted-foreground text-center animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          Your request is in good hands. We'll keep you posted.
        </p>

        {show && (
          <div className="mt-8 w-full rounded-3xl bg-card border border-border p-5 shadow-soft animate-slide-up">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Ticket ID
              </span>
              {/* <button className="text-primary cursor-pointer hover:opacity-85 transition-opacity">
                <Share2 className="h-4 w-4" />
              </button> */}
            </div>
            <p className="mt-1 text-[22px] font-extrabold tracking-tight">{currentSequenceId}</p>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <UserCircle2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-muted-foreground">Assigned specialist</p>
                  <p className="text-[13px] font-semibold truncate">
                    {assignedName ? `${assignedName} · Support Specialist` : "not assign yet"}
                  </p>
                </div>
              </div>
              <Info
                icon={Clock}
                label="Estimated resolution"
                value={getEstimatedResolution(priority)}
              />
            </div>
          </div>
        )}

        <div className="mt-auto w-full space-y-3 pt-10">
          <Link
            to="/tickets/$id"
            params={{ id: ticketId || "" }}
            disabled={!ticketId}
            className={`flex items-center justify-center gap-2 h-14 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated transition-all ${
              !ticketId ? "opacity-50 pointer-events-none" : "hover:opacity-95 active:scale-[0.99]"
            }`}
          >
            View ticket <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/dashboard"
            className="block text-center h-14 leading-[3.5rem] rounded-2xl bg-secondary font-semibold hover:bg-secondary/90 active:scale-[0.99] transition-all"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </MobileShell>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-[13px] font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}
