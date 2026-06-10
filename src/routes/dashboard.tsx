import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { tickets, technicians, statusStyles, priorityStyles } from "@/lib/mock";
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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
  const { user, profile } = useAuth();

  const getInitials = () => {
    if (profile?.fullName) {
      const parts = profile.fullName.trim().split(" ");
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
        {/* Hero */}
        <div className="relative px-5 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-6 bg-gradient-hero text-white rounded-b-[2rem] overflow-hidden">
          <div className="absolute -top-20 -right-10 h-56 w-56 rounded-full bg-primary-glow/40 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-mesh opacity-50" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center font-bold">
                {getInitials()}
              </div>
              <div>
                <p className="text-[11px] text-white/60 uppercase tracking-wider">Good afternoon</p>
                <p className="text-[15px] font-semibold">{profile?.fullName || "Guest"}</p>
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

          <Link
            to="/tickets"
            className="relative mt-5 flex items-center gap-2 h-12 rounded-2xl glass-dark px-4 text-white/70 text-sm"
          >
            <Search className="h-4 w-4" />
            <span>Search tickets, IDs, technicians…</span>
          </Link>

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

        {/* Summary cards */}
        <div className="px-5 mt-5">
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
        </div>

        {/* Quick actions */}
        <div className="px-5 mt-6">
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { label: "Raise", icon: Plus, to: "/tickets/new" },
              { label: "Chat", icon: Bell, to: "/chat" },
              { label: "SLA", icon: AlertTriangle, to: "/tickets" },
              { label: "KB", icon: Zap, to: "/tickets" },
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
          <Link to="/profile" className="text-[12px] text-primary font-semibold">
            View team
          </Link>
        </div>
        <div className="px-5 mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {technicians.map((t) => (
            <div
              key={t.name}
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
              <p className="mt-2 text-[10px] font-semibold text-primary">{t.load} active</p>
            </div>
          ))}
        </div>

        {/* Recent tickets */}
        <div className="px-5 mt-7 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">Recent tickets</h2>
          <Link to="/tickets" className="text-[12px] text-primary font-semibold">
            See all
          </Link>
        </div>
        <div className="px-5 mt-3 space-y-2.5">
          {tickets.slice(0, 4).map((t) => (
            <Link
              key={t.id}
              to="/tickets/$id"
              params={{ id: t.id }}
              className="block rounded-2xl bg-card border border-border p-4 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground tracking-wider">
                  {t.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[t.status].bg} ${statusStyles[t.status].text}`}
                >
                  {statusStyles[t.status].label}
                </span>
              </div>
              <p className="mt-1.5 text-[14px] font-semibold leading-snug">{t.title}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${priorityStyles[t.priority].dot}`} />
                  <span className="text-[11px] text-muted-foreground">
                    {priorityStyles[t.priority].label} · {t.category}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">{t.updated}</span>
              </div>
            </Link>
          ))}
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
