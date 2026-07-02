import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Clock,
  X,
  Lock,
  CreditCard,
  Wrench,
  Globe,
  Laptop,
  Settings,
  Shield,
  Sparkles,
  Folder,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import {
  formatUSDateTime,
  formatSLAWithCountdown,
  getStatusBadgeClass,
  getPriorityBadgeClass,
} from "@/lib/formatters";
import { MobileShell } from "@/components/layout/MobileShell";
import { BottomNav } from "@/components/layout/BottomNav";
import { useHeaderSetup } from "@/components/layout/HeaderContext";
import type { Ticket } from "@/types/store";

// =========================================
// CARD DESIGN HELPERS
// =========================================

// Helper to match category to Lucide icon, colors, and background based on image design
const getCategoryIconComponent = (category: string, subject: string) => {
  const cat = category?.toLowerCase() || "";
  const sub = subject?.toLowerCase() || "";

  if (
    sub.includes("checkout") ||
    sub.includes("billing") ||
    sub.includes("payment") ||
    sub.includes("card") ||
    cat === "billing" ||
    cat === "email"
  ) {
    return {
      Icon: CreditCard,
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
      Icon: Globe,
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
    Icon: Folder,
    color: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800/50",
  };
};

// Helper to calculate progress percentage and status label based on ticket state
const getTicketProgress = (status: string, hasAssignee: boolean) => {
  const s = status?.toLowerCase() || "";
  if (s === "open") {
    if (hasAssignee) {
      return { percent: 40, label: "Being Reviewed" };
    }
    return { percent: 10, label: "Awaiting Assignment" };
  }
  if (s === "pending" || s === "waiting") {
    return { percent: 20, label: "Assigned" };
  }
  if (s === "in_progress") {
    return { percent: 60, label: "Resolution In Progress" };
  }
  if (s === "resolved") {
    return { percent: 100, label: "Resolved" };
  }
  if (s === "closed") {
    return { percent: 100, label: "Closed" };
  }
  return { percent: 0, label: "Submitted" };
};

// Helper for relative time display
const getRelativeTime = (isoString: string) => {
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

// Helper for technician initials
const getInitials = (name: string | null) => {
  if (!name || name === "Unassigned") return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function TicketQueue({
  searchParams,
}: {
  searchParams: {
    search?: string;
    status?: string;
    priority?: string;
    page?: number;
    sortBy?: "newest" | "oldest" | "priority";
  };
}) {
  const navigate = useNavigate({ from: "/tickets/" });
  const tickets = useAppSelector((state) => state.tickets.tickets) as Ticket[];
  const technicians = useAppSelector((state) => state.technicians.technicians);

  const form = useForm({
    defaultValues: {
      search: searchParams.search || "",
      status: searchParams.status,
      priority: searchParams.priority,
    },
  });

  const searchValue = form.watch("search");
  const statusValue = form.watch("status");
  const priorityValue = form.watch("priority");

  useEffect(() => {
    if (searchParams.status !== statusValue || searchParams.priority !== priorityValue) {
      navigate({
        search: (prev) => ({
          ...prev,
          status: (statusValue as "open" | "in_progress" | "resolved" | "closed" | "all") || "all",
          priority: priorityValue,
        }),
        replace: true,
      });
    }
  }, [statusValue, priorityValue, navigate, searchParams.status, searchParams.priority]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const searchVal = searchValue || undefined;
      if (searchParams.search !== searchVal) {
        navigate({
          search: (prev) => ({
            ...prev,
            status: prev.status || "all",
            search: searchVal,
          }),
          replace: true,
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, navigate, searchParams.search]);

  useEffect(() => {
    const currentValues = form.getValues();
    const searchVal = searchParams.search || "";
    const statusVal = searchParams.status;
    const priorityVal = searchParams.priority;

    if (
      currentValues.search !== searchVal ||
      currentValues.status !== statusVal ||
      currentValues.priority !== priorityVal
    ) {
      form.reset(
        {
          search: searchVal,
          status: statusVal,
          priority: priorityVal,
        },
        { keepDefaultValues: true },
      );
    }
  }, [searchParams, form]);

  const filteredList = useMemo(() => {
    const list = tickets.filter((ticket) => {
      const displaySubject = (ticket as Ticket & { title?: string }).title || ticket.subject || "";
      const displaySequenceId = ticket.ticketSequenceId || ticket.id || "";
      const requester = ticket.requesterName || "";
      const requesterEmail = ticket.requesterEmail || "";
      const assignee = ticket.assignedToName || "";
      const matchSearch =
        !searchParams.search ||
        (
          displaySubject +
          " " +
          displaySequenceId +
          " " +
          requester +
          " " +
          requesterEmail +
          " " +
          assignee
        )
          .toLowerCase()
          .includes(searchParams.search.toLowerCase());
      const matchStatus =
        !searchParams.status ||
        searchParams.status === "all" ||
        ticket.status === searchParams.status;
      const matchPriority = !searchParams.priority || ticket.priority === searchParams.priority;
      return matchSearch && matchStatus && matchPriority;
    });

    const PRIORITY_ORDER: Record<string, number> = {
      critical: 4,
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const sortBy = searchParams.sortBy || "newest";
    return list.sort((a, b) => {
      if (sortBy === "oldest") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      }
      if (sortBy === "priority") {
        const pA = PRIORITY_ORDER[a.priority?.toLowerCase()] || 0;
        const pB = PRIORITY_ORDER[b.priority?.toLowerCase()] || 0;
        if (pB !== pA) {
          return pB - pA;
        }
        // Secondary sort: newest first
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      // Default newest: newest first
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [tickets, searchParams]);

  // Pagination Logic (20 items per page)
  const ITEMS_PER_PAGE = 20;
  const currentPage = searchParams.page || 1;
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedList = useMemo(() => {
    return filteredList.slice(0, safePage * ITEMS_PER_PAGE);
  }, [filteredList, safePage]);

  const handleLoadMore = () => {
    if (safePage >= totalPages) return;
    navigate({
      search: (prev) => ({ ...prev, page: safePage + 1 }),
      replace: true,
    });
  };

  useHeaderSetup(
    {
      title: "Tickets",
      subtitle: `${filteredList.length} request`,
    },
    [filteredList.length],
  );

  const tabs = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "in_progress", label: "In Progress" },
    { key: "resolved", label: "Resolved" },
    { key: "closed", label: "Closed" },
  ];

  const handleTabClick = (key: string) => {
    if (key === "all") {
      form.setValue("status", undefined);
    } else {
      form.setValue("status", key);
    }
  };

  const activeTab = form.watch("status") || "all";

  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-24 flex flex-col w-full max-w-md mx-auto">
        <div className="px-4 mt-2 shrink-0">
          <form onSubmit={(e) => e.preventDefault()}>
            <label className="flex items-center gap-2 h-12 px-4 rounded-2xl bg-secondary focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 focus-within:bg-card focus-within:shadow-soft transition-all border border-transparent">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                {...form.register("search")}
                placeholder="Search by ID, subject…"
                className="flex-1 bg-transparent outline-none text-[15px] w-full text-foreground placeholder:text-muted-foreground/50"
              />
              {form.watch("search") && (
                <button
                  type="button"
                  onClick={() => form.setValue("search", "")}
                  className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>
          </form>
        </div>

        <div className="mt-4 px-4 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabClick(t.key)}
              type="button"
              className={`shrink-0 px-5 h-10 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
                activeTab === t.key
                  ? "bg-[oklch(0.28_0.14_263)] text-white shadow-sm"
                  : "bg-[oklch(0.95_0.012_250)] text-[oklch(0.35_0.05_260)] hover:bg-[oklch(0.91_0.02_250)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-4 mt-4 pb-30 flex flex-col gap-3 flex-1">
          {paginatedList.map((ticket) => {
            const hasAssignee = !!ticket.assignedToName;
            const progress = getTicketProgress(ticket.status, hasAssignee);
            const isPriority = ticket.priority === "critical" || ticket.priority === "urgent";

            // Badge style mapping
            let badgeText = ticket.status;
            let badgeClass = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"; // default fallback

            if (isPriority) {
              badgeText = "Priority";
              badgeClass = "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400";
            } else if (ticket.status === "open") {
              badgeText = "Open";
              badgeClass = "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400";
            } else if (ticket.status === "pending" || ticket.status === "waiting") {
              badgeText = "Waiting";
              badgeClass = "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400";
            } else if (ticket.status === "in_progress") {
              badgeText = "In Progress";
              badgeClass =
                "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400";
            } else if (ticket.status === "resolved") {
              badgeText = "Resolved";
              badgeClass =
                "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400";
            } else if (ticket.status === "closed") {
              badgeText = "Closed";
              badgeClass = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
            }

            // Find tech role
            const tech = technicians.find(
              (t) => t.name === ticket.assignedToName || t.uid === ticket.assignedToId,
            );
            const assignedRole = tech?.role || "Support Specialist";

            // Resolve dynamic Lucide icon matching the category/subject
            const {
              Icon: CategoryIcon,
              color: iconColor,
              bg: iconBg,
            } = getCategoryIconComponent(ticket.category, ticket.subject);

            return (
              <Link
                key={ticket.id}
                to="/tickets/$id"
                params={{ id: ticket.id }}
                className="block rounded-3xl bg-card border border-border/60 p-4 px-5 shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-200"
              >
                {/* Top Row: Icon, ID, Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Circle icon container using Lucide icons */}
                    <div
                      className={`h-9 w-9 rounded-full ${iconBg} flex items-center justify-center shrink-0 border border-slate-100/30 dark:border-slate-800/30`}
                    >
                      <CategoryIcon className={`h-4.5 w-4.5 ${iconColor}`} />
                    </div>
                    {/* Sequence ID */}
                    <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                      {ticket.ticketSequenceId || ticket.id.slice(0, 10)}
                    </span>
                  </div>
                  {/* Status Badge */}
                  <span
                    className={`text-[12px] font-bold px-3 py-1 rounded-full ${badgeClass} capitalize`}
                  >
                    {badgeText.replace("_", " ")}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-2 text-[15px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                  {(ticket as Ticket & { title?: string }).title || ticket.subject}
                </h3>

                {/* Progress bar section */}
                <div className="mt-2.5">
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-brand rounded-full transition-all duration-300"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[12px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    <span>{progress.label}</span>
                    <span>{progress.percent}%</span>
                  </div>
                </div>

                {/* Conditional Assignee Row */}
                {ticket.assignedToName && (
                  <>
                    {/* Divider Line */}
                    <div className="border-t border-slate-100/80 dark:border-slate-800/80 my-3" />

                    {/* Assignee Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Avatar circle */}
                        <div className="h-9 w-9 rounded-full bg-[oklch(0.28_0.14_263)] text-white flex items-center justify-center font-bold text-[13px] shrink-0">
                          {getInitials(ticket.assignedToName)}
                        </div>
                        {/* Assignee Text Stack */}
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">
                            {ticket.assignedToName}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {assignedRole}
                          </span>
                        </div>
                      </div>

                      {/* Relative time */}
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 dark:text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-slate-400/80" />
                        <span>{getRelativeTime(ticket.updatedAt || ticket.createdAt)}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Priority dot at the bottom */}
                {ticket.priority && (
                  <div
                    className={`flex items-center gap-1.5 mt-2 text-[12px] font-bold ${
                      ticket.priority === "critical" ||
                      ticket.priority === "urgent" ||
                      ticket.priority === "high"
                        ? "text-red-600"
                        : ticket.priority === "medium"
                          ? "text-amber-600"
                          : "text-slate-500"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        ticket.priority === "critical" ||
                        ticket.priority === "urgent" ||
                        ticket.priority === "high"
                          ? "bg-red-600"
                          : ticket.priority === "medium"
                            ? "bg-amber-600"
                            : "bg-slate-500"
                      }`}
                    />
                    <span className="capitalize">{ticket.priority}</span>
                  </div>
                )}
              </Link>
            );
          })}

          {/* Load More Button */}
          {safePage < totalPages && (
            <div className="mt-4 flex justify-center pb-4">
              <button
                type="button"
                onClick={handleLoadMore}
                className="flex items-center gap-2 h-11 px-6 rounded-full bg-secondary text-foreground font-bold text-[13px] hover:bg-muted transition-colors border border-transparent shadow-sm"
              >
                Load More Tickets
              </button>
            </div>
          )}

          {/* Upgraded Empty State */}
          {filteredList.length === 0 && (
            <div className="text-center py-12 px-6 flex flex-col items-center justify-center flex-1">
              <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4">
                <SlidersHorizontal className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <h3 className="text-[15px] font-bold text-foreground">No tickets found</h3>
              <p className="mt-1 text-[12.5px] text-muted-foreground max-w-[240px] leading-normal">
                We couldn't find any tickets matching your search query or selected filters.
              </p>
              <div className="mt-5 flex gap-2 w-full max-w-[240px]">
                <button
                  type="button"
                  onClick={() => {
                    form.reset({
                      search: "",
                      status: undefined,
                      priority: undefined,
                    });
                    navigate({
                      search: () => ({ status: "all" as const }),
                      replace: true,
                    });
                  }}
                  className="flex-1 py-2 rounded-xl bg-secondary text-foreground text-[12.5px] font-bold hover:bg-muted transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
                <Link
                  to="/tickets/new"
                  className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-[12.5px] font-bold hover:opacity-90 transition-opacity text-center"
                >
                  New Ticket
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* <Link
        to="/tickets/new"
        className="fixed z-50 bottom-24 right-5 h-14 w-14 rounded-full bg-gradient-brand text-primary-foreground shadow-elevated hover:shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer min-h-[48px]"
        style={{ left: "calc(50% + 220px - 76px)" }}
      >
        <Plus className="h-6 w-6" />
      </Link> */}

      <BottomNav />
    </MobileShell>
  );
}
