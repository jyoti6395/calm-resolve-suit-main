import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
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
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { getStatusBadgeClass, getPriorityBadgeClass, formatUSDateTime } from "@/lib/formatters";
import type { Ticket } from "@/types/store";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import { CategoryGrid } from "@/features/dashboard/components/CategoryGrid";
import { RecentTicketsList } from "@/features/dashboard/components/RecentTicketsList";

function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const { technicians: dbTechnicians } = useAppSelector((state) => state.technicians);
  const dbTickets = useAppSelector((state) => state.tickets.tickets) as Ticket[];

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 22) return "Good evening";
    return "Good night";
  }, []);

  const openCount = useMemo(() => {
    return dbTickets.filter((t) => t.status?.toLowerCase() === "open").length;
  }, [dbTickets]);

  const in_progressCount = useMemo(() => {
    return dbTickets.filter((t) => {
      const s = t.status?.toLowerCase();
      return s === "pending" || s === "in_progress";
    }).length;
  }, [dbTickets]);

  const resolvedCount = useMemo(() => {
    return dbTickets.filter((t) => t.status?.toLowerCase() === "resolved").length;
  }, [dbTickets]);

  const closedCount = useMemo(() => {
    return dbTickets.filter((t) => t.status?.toLowerCase() === "closed").length;
  }, [dbTickets]);

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
    return [...dbTickets]
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 5);
  }, [dbTickets]);

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
        <div className="relative px-5 pb-8 bg-[oklch(0.22_0.12_263)] text-white rounded-b-[2.5rem] overflow-hidden">
          <div className="absolute inset-0 opacity-50" />

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
        </div>

        {/* Summary cards */}
        <SummaryCards summary={summary} />

        {/* How can we help? Section */}
        <CategoryGrid />

        {/* Recent tickets */}
        <RecentTicketsList tickets={recentTickets} />
      </div>

      {/* FAB */}
      <Link
        to="/tickets/new"
        className="fixed z-50 bottom-24 right-5 h-14 px-5 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated hover:shadow-glow flex items-center gap-2 transition-all"
        style={{ left: "calc(50% + 220px - 160px)" }}
      >
        <Plus className="h-5 w-5" /> Raise
      </Link>

      <BottomNav />
    </MobileShell>
  );
}
