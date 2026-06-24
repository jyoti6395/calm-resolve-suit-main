import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { MobileShell } from "@/components/layout/MobileShell";
import { DesktopPageShell } from "@/components/layout/DesktopPageShell";
import { useIsMobile } from "@/hooks/use-mobile";
import { CheckCircle2, ArrowRight, Clock, UserCircle2, ArrowLeft, Mail, Phone } from "lucide-react";
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
  const isMobile = useIsMobile();

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

  // Desktop & Tablet layout
  if (!isMobile) {
    return (
      <DesktopPageShell noPadding>
        <div className="flex flex-col h-full w-full bg-slate-50 min-h-screen">
          {/* Top Breadcrumb Header */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-[18px] font-bold text-slate-800 tracking-tight">
                  Ticket Confirmation
                </h1>
                <p className="text-[13px] text-slate-500 mt-0.5 font-medium">
                  Review your submitted ticket and next steps
                </p>
              </div>
            </div>
          </div>

          {/* Main Layout Area */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 w-full items-start">
              {/* Column 1: Confirmation success card & Actions */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col items-center">
                  {/* Success checkmark */}
                  <div className="relative">
                    <span className="absolute inset-0 rounded-full bg-success/30 animate-pulse-ring" />
                    <span
                      className="absolute inset-0 rounded-full bg-success/20 animate-pulse-ring"
                      style={{ animationDelay: "0.4s" }}
                    />
                    <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-success to-[oklch(0.55_0.18_155)] flex items-center justify-center shadow-elevated animate-scale-in">
                      <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  <h2 className="mt-6 text-[24px] font-extrabold tracking-tight text-center text-slate-800 animate-slide-up">
                    Ticket raised successfully
                  </h2>
                  <p className="mt-2 text-[14px] text-slate-500 text-center max-w-md animate-slide-up">
                    Your request is in good hands. We've notified our support engineers and will
                    keep you posted.
                  </p>

                  {show && (
                    <div className="mt-8 w-full max-w-lg rounded-2xl bg-slate-50 border border-slate-200 p-6 animate-slide-up">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Ticket ID
                        </span>
                      </div>
                      <p className="mt-1 text-[24px] font-extrabold tracking-tight text-slate-800">
                        {currentSequenceId}
                      </p>

                      <div className="mt-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <UserCircle2 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-slate-400">Assigned specialist</p>
                            <p className="text-[13px] font-bold text-slate-800 truncate">
                              {assignedName
                                ? `${assignedName} · Support Specialist`
                                : "not assign yet"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-slate-400">Estimated resolution</p>
                            <p className="text-[13px] font-bold text-slate-800 truncate">
                              {getEstimatedResolution(priority)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-8 w-full max-w-lg flex flex-col sm:flex-row gap-3">
                    <Link
                      to="/tickets/$id"
                      params={{ id: ticketId || "" }}
                      disabled={!ticketId}
                      className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-brand text-primary-foreground font-semibold shadow-sm transition-all ${
                        !ticketId
                          ? "opacity-50 pointer-events-none"
                          : "hover:opacity-95 active:scale-[0.99]"
                      }`}
                    >
                      View ticket <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex-1 flex items-center justify-center h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold active:scale-[0.99] transition-all"
                    >
                      Back to dashboard
                    </Link>
                  </div>
                </div>
              </div>

              {/* Column 2: Direct Contact info card matching SupportView */}
              <div className="space-y-6">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-4 pl-2">
                    Direct Contact
                  </p>
                  <div className="rounded-[2rem] bg-gradient-hero text-white p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary-glow/40 blur-3xl" />
                    <div className="relative space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/60 uppercase font-bold leading-none">
                            Support Email
                          </p>
                          <a
                            href="mailto:support@company.com"
                            className="text-[14px] font-bold hover:underline block mt-1"
                          >
                            support@company.com
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                          <Phone className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/60 uppercase font-bold leading-none">
                            Direct Phone
                          </p>
                          <a
                            href="tel:+919876543210"
                            className="text-[14px] font-bold hover:underline block mt-1"
                          >
                            +91 98765 43210
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/60 uppercase font-bold leading-none">
                            Working Hours
                          </p>
                          <p className="text-[13.5px] font-bold block mt-1">
                            Monday - Friday, 9:00 AM - 6:00 PM
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer version info */}
            <div className="py-8 text-center border-t border-slate-200/50 mt-12">
              <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
                AdviseTech v3.4.1 · SOC 2 Type II
              </p>
            </div>
          </div>
        </div>
      </DesktopPageShell>
    );
  }

  // Mobile view (unchanged)
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
