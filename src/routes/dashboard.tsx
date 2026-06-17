import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  Bell,
  Plus,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  Lock,
  FileText,
  Wifi,
  CreditCard,
  Laptop,
  Key,
  Terminal,
  Sparkles,
  Server,
  Shield,
  Search,
  FileWarning,
  ChevronRight,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import {
  getStatusBadgeClass,
  getPriorityBadgeClass,
  formatUSDateTime,
  formatSLAWithCountdown,
} from "@/lib/formatters";
import type { Ticket } from "@/types/store";
import { getUserRoles } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import { CategoryGrid } from "@/features/dashboard/components/CategoryGrid";
import { RecentTicketsList } from "@/features/dashboard/components/RecentTicketsList";

function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const { isTechnician, isCustomer } = getUserRoles(user?.role);
  const { technicians: dbTechnicians } = useAppSelector((state) => state.technicians);
  const dbTickets = useAppSelector((state) => state.tickets.tickets) as Ticket[];
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 22) return "Good evening";
    return "Good night";
  }, []);

  const dashboardTickets = useMemo(() => {
    if (isTechnician && user?.uid) {
      return dbTickets.filter((t) => t.assignedToId === user.uid);
    }
    return dbTickets;
  }, [dbTickets, isTechnician, user]);

  const openCount = useMemo(() => {
    return dashboardTickets.filter((t) => t.status?.toLowerCase() === "open").length;
  }, [dashboardTickets]);

  const in_progressCount = useMemo(() => {
    return dashboardTickets.filter((t) => {
      const s = t.status?.toLowerCase();
      return s === "pending" || s === "in_progress";
    }).length;
  }, [dashboardTickets]);

  const resolvedCount = useMemo(() => {
    return dashboardTickets.filter((t) => t.status?.toLowerCase() === "resolved").length;
  }, [dashboardTickets]);

  const closedCount = useMemo(() => {
    return dashboardTickets.filter((t) => t.status?.toLowerCase() === "closed").length;
  }, [dashboardTickets]);

  const summary = useMemo(
    () => [
      {
        key: "open",
        label: "Open",
        value: openCount,
        icon: FileText,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        statusFilter: "open",
      },
      {
        key: "in_progress",
        label: "In Progress",
        value: in_progressCount,
        icon: Clock,
        color: "text-warning",
        bg: "bg-warning/15",
        statusFilter: "in_progress",
      },
      {
        key: "resolved",
        label: "Resolved",
        value: resolvedCount,
        icon: CheckCircle2,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        statusFilter: "resolved",
      },
      {
        key: "closed",
        label: "Closed",
        value: closedCount,
        icon: Lock,
        color: "text-slate-500",
        bg: "bg-slate-500/10",
        statusFilter: "closed",
      },
    ],
    [openCount, in_progressCount, resolvedCount, closedCount],
  );

  const recentTickets = useMemo(() => {
    return [...dashboardTickets]
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 5);
  }, [dashboardTickets]);

  const filteredRecentTickets = useMemo(() => {
    if (!searchQuery) return recentTickets;
    const query = searchQuery.toLowerCase();
    return dashboardTickets
      .filter((t) => {
        const title = (t as Ticket & { title?: string }).title || t.subject || "";
        const seqId = t.ticketSequenceId || t.id || "";
        const assignedName = t.assignedToName || "";
        const category = t.category || "";
        return (
          title.toLowerCase().includes(query) ||
          seqId.toLowerCase().includes(query) ||
          assignedName.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 5);
  }, [dashboardTickets, recentTickets, searchQuery]);

  const atRiskTickets = useMemo(() => {
    return dashboardTickets
      .filter((t) => {
        if (t.status === "resolved" || t.status === "closed") return false;
        if (!t.slaDeadline) return false;
        const { isBreached } = formatSLAWithCountdown(t.slaDeadline);
        return !isBreached;
      })
      .sort((a, b) => new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime());
  }, [dashboardTickets]);

  const atRiskCount = atRiskTickets.length;
  const atRiskTicket = atRiskTickets[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({
        to: "/tickets",
        search: { search: searchQuery.trim(), status: "all" },
      });
    }
  };

  const displayTechnicians = dbTechnicians
    .filter((t) => t.online)
    .map((t) => {
      const activeLoad = dbTickets.filter(
        (ticket) =>
          ticket.assignedToId === t.uid &&
          ticket.status !== "resolved" &&
          ticket.status !== "closed",
      ).length;
      return {
        ...t,
        load: activeLoad,
      };
    });

  const getInitials = () => {
    if (user?.displayName) {
      const parts = user.displayName.trim().split(" ");
      if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "AP";
  };

  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-32">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-[oklch(0.22_0.12_263)] backdrop-blur-md px-5 pt-[env(safe-area-inset-top,0px)] text-white">
          <div className="relative flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center font-bold">
                {getInitials()}
              </div>
              <div>
                <p className="text-[11px] text-white/60 uppercase tracking-wider">{greeting}</p>
                <p className="text-[15px] font-semibold">{user?.displayName || "Guest"}</p>
              </div>
            </div>
            <Link
              to="/notifications"
              className="relative h-11 w-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-[oklch(0.18_0.12_263)]" />
            </Link>
          </div>
        </div>

        {/* Hero with Rounded Bottom Corners */}
        <div className="relative px-5 pb-8 bg-gradient-hero text-white rounded-b-[2.5rem] overflow-hidden">
          <div className="absolute inset-0 opacity-50" />

          {isTechnician ? (
            /* Technician Hero View */
            <div className="relative z-10 flex flex-col pt-2 pb-1">
              {/* Search input capsule */}
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative flex items-center h-12 w-full rounded-full bg-gradient-to-r from-[#0d46c5] to-[#07329b] border border-white/10 hover:brightness-105 focus-within:brightness-105 transition-all px-4">
                  <Search className="h-4.5 w-4.5 text-white/80 shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tickets, IDs, technicians..."
                    className="flex-1 bg-transparent border-none outline-none text-[14px] text-white placeholder:text-white/70 w-full animate-fade-in"
                  />
                </div>
              </form>

              {/* SLA at risk card */}
              {atRiskTicket ? (
                <Link
                  to="/tickets/$id"
                  params={{ id: atRiskTicket.id }}
                  className="w-full mt-4 flex items-center justify-between rounded-full bg-white/5 backdrop-blur-md border border-white/10 py-3.5 px-5 hover:bg-white/10 transition-all active:scale-[0.99] animate-slide-up"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-9 w-9 rounded-full bg-[#511c27] flex items-center justify-center shrink-0 text-white">
                      <FileWarning className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-white tracking-tight leading-normal">
                        {atRiskCount} SLA{atRiskCount > 1 ? "s" : ""} at risk
                      </p>
                      <p className="text-[11px] text-white/60 truncate font-semibold mt-0.5 leading-normal">
                        {atRiskTicket.ticketSequenceId || atRiskTicket.id.slice(0, 10)} •{" "}
                        {(atRiskTicket as Ticket & { title?: string }).title ||
                          atRiskTicket.subject}{" "}
                        — {formatSLAWithCountdown(atRiskTicket.slaDeadline).text}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4.5 w-4.5 text-white/50 shrink-0 ml-2" />
                </Link>
              ) : (
                <div className="w-full mt-4 flex items-center justify-between rounded-full bg-white/5 backdrop-blur-md border border-white/10 py-3.5 px-5 animate-slide-up">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-9 w-9 rounded-full bg-[#143d28] flex items-center justify-center shrink-0 text-white">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-white tracking-tight leading-normal">
                        All SLAs on track
                      </p>
                      <p className="text-[11px] text-white/60 truncate font-semibold mt-0.5 leading-normal">
                        Excellent! No tickets require immediate attention.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Customer Hero View */
            <>
              {/* Hero Content */}
              <div className="relative z-10 mt-6">
                <h1 className="text-[28px] font-bold  leading-tight tracking-tight text-white">
                  How can we help today?
                </h1>
                <p className="mt-2 text-[13px] font-semibold  text-white/70 leading-relaxed mx-auto">
                  Submit requests, track progress, and stay connected with our support team.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 flex items-center gap-3 mt-7 w-full">
                <Link
                  to="/tickets/new"
                  className="flex-[2.3] h-12 px-6 rounded-full bg-white hover:bg-white/95 text-primary font-semibold text-[14px] flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  Create request
                </Link>
                <Link
                  to="/tickets"
                  search={{ status: "all" }}
                  className="flex-1 h-12 px-6 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-[14px] flex items-center justify-center transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  Track request
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Summary cards */}
        <SummaryCards summary={summary} />

        {/* How can we help? Section */}
        <CategoryGrid />

        {/* Recent tickets */}
        <RecentTicketsList tickets={filteredRecentTickets} />
      </div>

      {/* FAB */}
      {isCustomer && (
        <Link
          to="/tickets/new"
          className="fixed z-50 bottom-24 right-5 h-14 px-5 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated hover:shadow-glow flex items-center gap-2 transition-all"
          style={{ left: "calc(50% + 220px - 160px)" }}
        >
          <Plus className="h-5 w-5" /> Raise
        </Link>
      )}

      <BottomNav />
    </MobileShell>
  );
}
