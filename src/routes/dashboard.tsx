import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
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

const categoriesList = [
  {
    title: "Technical Support",
    desc: "App issues, errors, bugs",
    icon: Terminal,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    categoryKey: "Software",
  },
  {
    title: "Account Access",
    desc: "Login, password, 2FA",
    icon: Key,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    categoryKey: "Access",
  },
  {
    title: "Connectivity",
    desc: "Internet, Wi-Fi, VPN",
    icon: Wifi,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    categoryKey: "Network",
  },
  {
    title: "Billing Support",
    desc: "Invoices, payments, refunds",
    icon: CreditCard,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    categoryKey: "Email",
  },
  {
    title: "Product Support",
    desc: "Features and how-tos",
    icon: Laptop,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    categoryKey: "Hardware",
  },
  {
    title: "General Enquiries",
    desc: "Other queries",
    icon: Sparkles,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    categoryKey: "Other",
  },
  // {
  //   title: "Security & Audits",
  //   desc: "Compliance, spam, threats",
  //   icon: Shield,
  //   color: "text-rose-500",
  //   bg: "bg-rose-500/10",
  //   categoryKey: "Security",
  // },
];

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
              search={{ search: "" }}
              className="flex-1 h-12 px-6 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-[14px] flex items-center justify-center transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Track request
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="px-5 mt-5">
          <div className="grid grid-cols-2 gap-3">
            {summary.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  to="/tickets"
                  search={{ status: s.statusFilter }}
                  key={s.key}
                  className="rounded-[1.5rem] bg-card border border-border/80 p-3 shadow-sm hover:shadow-soft hover:-translate-y-0.5 active:scale-[0.98] transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`h-9 w-9 rounded-full ${s.bg} flex items-center justify-center`}
                    >
                      <Icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/45" />
                  </div>
                  <div className="mt-2.5">
                    <p className="text-[24px] font-bold text-foreground leading-none">{s.value}</p>
                    <p className="mt-1 text-[11.5px] text-muted-foreground font-medium">
                      {s.label}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* How can we help? Section */}
        <div className="px-5 mt-7 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">How can we help?</h2>
          <Link to="/tickets/new" className="text-[12px] text-primary font-semibold">
            See all
          </Link>
        </div>
        <div className="px-5 mt-3">
          <div className="grid grid-cols-2 gap-3">
            {categoriesList.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  to="/tickets/new"
                  search={{ category: cat.categoryKey }}
                  key={cat.title}
                  className="rounded-2xl bg-card border border-border/85 p-4 shadow-sm hover:shadow-soft hover:-translate-y-0.5 active:scale-[0.98] transition-all flex flex-col justify-between"
                >
                  <div
                    className={`h-10 w-10 rounded-full ${cat.bg} flex items-center justify-center shrink-0 self-start`}
                  >
                    <Icon className={`h-5 w-5 ${cat.color}`} />
                  </div>
                  <div className="mt-4">
                    <p className="text-[13px] font-bold text-foreground leading-snug">
                      {cat.title}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground  leading-normal">
                      {cat.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent tickets */}
        <div className="px-5 mt-7 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">Recent tickets</h2>
          <Link to="/tickets" className="text-[12px] text-primary font-semibold">
            See all
          </Link>
        </div>
        <div className="px-5 mt-3 pb-30 space-y-2.5">
          {recentTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-3xl p-6 bg-card/50 text-center">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-3">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <h3 className="text-[14px] font-bold text-foreground">No recent tickets</h3>
              <p className="mt-1 text-[11px] text-muted-foreground max-w-[220px] leading-relaxed">
                There are no recent tickets to display at this time.
              </p>
            </div>
          ) : (
            recentTickets.map((t) => (
              <Link
                key={t.id}
                to="/tickets/$id"
                params={{ id: t.id }}
                className="block rounded-2xl bg-card border border-border p-4 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider">
                    {t.ticketSequenceId || t.id.slice(0, 10)}
                  </span>
                  <span
                    className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full ${getStatusBadgeClass(t.status)} capitalize`}
                  >
                    {t.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] font-semibold leading-snug">
                  {(t as Ticket & { title?: string }).title || t.subject}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${getPriorityBadgeClass(t.priority).dot}`}
                    />
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {t.priority} · {t.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {formatUSDateTime(t.updatedAt || t.createdAt)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
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
