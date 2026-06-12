import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import {
  Search,
  Bell,
  Plus,
  ChevronRight,
  Zap,
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  User,
  X,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { getStatusBadgeClass, getPriorityBadgeClass, formatUSDateTime } from "@/lib/formatters";
import type { Ticket } from "@/types/store";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

const summary = [
  {
    key: "open",
    label: "Open",
    value: 24,
    delta: "+3",
    icon: Zap,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    key: "pending",
    label: "Pending",
    value: 12,
    delta: "−1",
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/15",
  },
  {
    key: "resolved",
    label: "Resolved",
    value: 86,
    delta: "+12",
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/15",
  },
  {
    key: "escalated",
    label: "Escalated",
    value: 3,
    delta: "+1",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/12",
  },
];

function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const { technicians: dbTechnicians } = useAppSelector((state) => state.technicians);
  const dbTickets = useAppSelector((state) => state.tickets.tickets) as Ticket[];

  const [searchQuery, setSearchQuery] = useState("");

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 22) return "Good evening";
    return "Good night";
  }, []);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return { tickets: [], technicians: [] };

    const matchedTickets = dbTickets.filter((t) => {
      return (
        t.subject?.toLowerCase().includes(query) ||
        t.ticketSequenceId?.toLowerCase().includes(query) ||
        t.id?.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    });

    const matchedTechnicians = dbTechnicians.filter((tech) => {
      return tech.name?.toLowerCase().includes(query) || tech.role?.toLowerCase().includes(query);
    });

    return {
      tickets: matchedTickets,
      technicians: matchedTechnicians,
    };
  }, [searchQuery, dbTickets, dbTechnicians]);

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
              <div className="h-11 w-11 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center font-bold">
                {getInitials()}
              </div>
              <div>
                <p className="text-[11px] text-white/60 uppercase tracking-wider">{greeting}</p>
                <p className="text-[15px] font-semibold">{user?.displayName || "Guest"}</p>
              </div>
            </div>
            <Link
              to="/notifications"
              className="relative h-11 w-11 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-[oklch(0.18_0.12_263)]" />
            </Link>
          </div>
        </div>

        {/* Hero with Rounded Bottom Corners */}
        <div className="relative px-5 pt-3 pb-7 bg-[oklch(0.22_0.12_263)] text-white rounded-b-[2.5rem] overflow-hidden">
          {/* Ambient Glows */}
          {/* <div className="absolute -top-20 -right-10 h-56 w-56 rounded-full bg-primary-glow/40 blur-3xl animate-float-orb" /> */}
          <div className="absolute inset-0  opacity-50" />

          <div className="relative mt-2 flex items-center gap-2 h-12 rounded-2xl glass-dark px-4 text-white text-sm">
            <Search className="h-4 w-4 text-white/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets, IDs, technicians…"
              className="bg-transparent border-none outline-none w-full text-white placeholder-white/60 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* SLA alert */}
          <div className="relative mt-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/30 flex items-center justify-center">
              <FileWarning className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold">1 SLA at risk</p>
              <p className="text-[11px] text-white/60 truncate">
                AT-2835 • Production DB latency — 32m remaining
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-white/60" />
          </div>
        </div>

        {searchQuery ? (
          <div className="px-5 mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-foreground">Search Results</h2>
              <button
                onClick={() => setSearchQuery("")}
                className="text-[12px] text-primary font-semibold hover:underline"
              >
                Clear
              </button>
            </div>

            {/* Technicians Section */}
            {searchResults.technicians.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
                  Technicians ({searchResults.technicians.length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {searchResults.technicians.map((t) => (
                    <div
                      key={t.uid}
                      className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3"
                    >
                      <div className="relative h-10 w-10 shrink-0 rounded-xl bg-gradient-brand text-white flex items-center justify-center font-bold text-sm">
                        {t.initials}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${t.online ? "bg-success" : "bg-muted-foreground"}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold truncate text-foreground">
                          {t.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">{t.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tickets Section */}
            {searchResults.tickets.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
                  Tickets ({searchResults.tickets.length})
                </h3>
                <div className="space-y-2.5">
                  {searchResults.tickets.map((t) => (
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
                      <p className="mt-1.5 text-[14px] font-semibold leading-snug text-foreground">
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
                  ))}
                </div>
              </div>
            )}

            {searchResults.technicians.length === 0 && searchResults.tickets.length === 0 && (
              <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-3xl p-8 bg-card/50 text-center">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-3">
                  <Search className="h-5 w-5 text-muted-foreground/60" />
                </div>
                <h3 className="text-[14px] font-bold text-foreground">No matches found</h3>
                <p className="mt-1.5 text-[11px] text-muted-foreground max-w-[240px] leading-relaxed">
                  We couldn't find any tickets or technicians matching "{searchQuery}".
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Summary cards */}
            {/* <div className="px-5 mt-5">
              <div className="grid grid-cols-2 gap-3">
                {summary.map((s) => {
                  const Icon = s.icon;
                  return (
                    <Link
                      to="/tickets"
                      key={s.key}
                      className="rounded-3xl bg-card border border-border p-4 shadow-soft hover:shadow-elevated transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                          <Icon className={`h-4 w-4 ${s.color}`} />
                        </div>
                        <span className="text-[11px] font-semibold text-success flex items-center gap-0.5">
                          <ArrowUpRight className="h-3 w-3" /> {s.delta}
                        </span>
                      </div>
                      <p className="mt-3 text-[28px] font-extrabold tracking-tight leading-none">
                        {s.value}
                      </p>
                      <p className="mt-1 text-[12px] text-muted-foreground font-medium">{s.label}</p>
                    </Link>
                  );
                })}
              </div>
            </div> */}

            {/* Quick actions */}
            <div className="px-5 mt-6">
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Raise", icon: Plus, to: "/tickets/new" },
                  { label: "Chat", icon: Bell, to: "/tickets" },
                  // { label: "SLA", icon: AlertTriangle, to: "/analytics" },
                  // { label: "KB", icon: Zap, to: "/tickets" },
                ].map((a) => (
                  <Link
                    key={a.label}
                    to={a.to}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-card border border-border"
                  >
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <a.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-semibold">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Technicians */}
            <div className="px-5 mt-7 flex items-center justify-between">
              <h2 className="text-[15px] font-bold">Technicians on shift</h2>
              {/* <Link to="/profile" className="text-[12px] text-primary font-semibold">
                View team
              </Link> */}
            </div>

            {displayTechnicians.length === 0 ? (
              <div className="px-5 mt-3">
                <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-3xl p-6 bg-card/50 text-center">
                  <div className="relative h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-card/60 flex items-center justify-center text-muted-foreground">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-primary border-2 border-card flex items-center justify-center text-primary-foreground">
                      <X className="h-3 w-3 stroke-[3]" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-[14px] font-bold text-foreground">
                    No Technicians Available
                  </h3>
                  <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed max-w-[280px]">
                    There are currently no technicians on shift.
                    <br />
                    Tickets will be assigned automatically when a technician becomes available.
                  </p>
                </div>
              </div>
            ) : (
              <div className="px-5 mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {displayTechnicians.map((t) => (
                  <div
                    key={t.uid}
                    className="shrink-0 w-[140px] rounded-2xl bg-card border border-border p-3"
                  >
                    <div className="relative h-11 w-11 rounded-2xl bg-gradient-brand text-white flex items-center justify-center font-bold">
                      {t.initials}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card ${t.online ? "bg-success" : "bg-muted-foreground"}`}
                      />
                    </div>
                    <p className="mt-2 text-[13px] font-semibold truncate">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{t.role}</p>
                    {/* <p className="mt-2 text-[10px] font-semibold text-primary">{t.load} active</p> */}
                  </div>
                ))}
              </div>
            )}

            {/* Recent tickets */}
            <div className="px-5  mt-7 flex items-center justify-between">
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
          </>
        )}
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
