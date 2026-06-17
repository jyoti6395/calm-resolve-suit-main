import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Wifi,
  Mail,
  Lock,
  Wrench,
  Laptop,
  Settings,
  Shield,
  Sparkles,
} from "lucide-react";
import type { Ticket } from "@/types/store";
import { getStatusBadgeClass } from "@/lib/formatters";

interface RecentTicketsSectionProps {
  recentTickets: Ticket[];
}

// Icon helper for ticket categories
const getCategoryIconComponent = (category: string = "", subject: string = "") => {
  const cat = category.toLowerCase();
  const sub = subject.toLowerCase();

  if (
    sub.includes("checkout") ||
    sub.includes("billing") ||
    sub.includes("payment") ||
    sub.includes("card") ||
    cat === "billing" ||
    cat === "email"
  ) {
    return {
      Icon: Mail,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/20",
    };
  }
  if (
    cat.includes("access") ||
    cat.includes("login") ||
    sub.includes("password") ||
    sub.includes("mfa") ||
    sub.includes("account")
  ) {
    return {
      Icon: Lock,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
    };
  }
  if (
    cat.includes("hardware") ||
    cat.includes("device") ||
    sub.includes("phone") ||
    sub.includes("printer") ||
    sub.includes("mac") ||
    sub.includes("calendar")
  ) {
    return {
      Icon: Wrench,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/20",
    };
  }
  if (cat.includes("network") || cat.includes("vpn") || cat.includes("wifi")) {
    return {
      Icon: Wifi,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/20",
    };
  }
  if (cat.includes("software")) {
    return {
      Icon: Laptop,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/20",
    };
  }
  if (cat.includes("infrastructure")) {
    return {
      Icon: Settings,
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-50 dark:bg-slate-900/50",
    };
  }
  if (cat.includes("security")) {
    return {
      Icon: Shield,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/20",
    };
  }
  return {
    Icon: Sparkles,
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-950/20",
  };
};

// Relative time display helper
const getRelativeTime = (isoString?: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs) || diffMs < 0) return "just now";
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export function RecentTicketsSection({ recentTickets }: RecentTicketsSectionProps) {
  return (
    <div className="mt-4 rounded-sm bg-card border border-border/70 p-4 shadow-sm hover:shadow-soft transition-all duration-200 shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-foreground">Recent Tickets</h2>
        <Link
          to="/tickets"
          search={{ status: "all" }}
          className="text-[11.5px] text-primary font-bold hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="mt-3.5 space-y-3.5">
        {recentTickets.length > 0 ? (
          recentTickets.map((t) => {
            const {
              Icon: CatIcon,
              color: catColor,
              bg: catBg,
            } = getCategoryIconComponent(t.category, t.subject);
            return (
              <Link
                key={t.id}
                to="/tickets/$id"
                params={{ id: t.id }}
                className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 p-1.5 -m-1.5 rounded-sm transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`h-8.5 w-8.5 rounded-full ${catBg} flex items-center justify-center shrink-0`}
                  >
                    <CatIcon className={`h-4 w-4 ${catColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                      {t.ticketSequenceId || t.id.slice(0, 10)}
                    </p>
                    <p className="text-[12.5px] font-bold text-foreground mt-0.5 truncate leading-tight">
                      {t.subject}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 ml-3">
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full capitalize ${getStatusBadgeClass(t.status)}`}
                  >
                    {t.status.replace("_", " ")}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground mt-1 font-medium">
                    {getRelativeTime(t.updatedAt || t.createdAt)}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 className="h-7 w-7 text-muted-foreground/40 mx-auto mb-1.5" />
            <p className="text-[12.5px] font-bold text-foreground">No recent tickets</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              There are no tickets for this timeframe.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
