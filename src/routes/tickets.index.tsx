import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, SlidersHorizontal, Plus, Clock, AlertTriangle, X } from "lucide-react";

import { useAppSelector } from "@/store/hooks";
import {
  formatUSDateTime,
  formatSLAWithCountdown,
  getStatusBadgeClass,
  getPriorityBadgeClass,
} from "@/lib/formatters";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useHeaderSetup } from "@/components/HeaderContext";
import type { Ticket } from "@/types/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// =========================================
// 1. URL SEARCH STATE PARAMETERS SCHEMA (ZOD)
// =========================================
const ticketSearchSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
});

export const Route = createFileRoute("/tickets/")({
  component: MobileTicketsQueue,
  validateSearch: (search) => ticketSearchSchema.parse(search),
});

function MobileTicketsQueue() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const tickets = useAppSelector((state) => state.tickets.tickets) as Ticket[];

  // =========================================
  // 3. RE-RENDER ISOLATED FILTERS
  // =========================================
  const form = useForm<z.infer<typeof ticketSearchSchema>>({
    resolver: zodResolver(ticketSearchSchema),
    defaultValues: {
      search: searchParams.search || "",
      status: searchParams.status,
      priority: searchParams.priority,
    },
  });

  // Debounce search input to URL state (300ms)
  useEffect(() => {
    const subscription = form.watch((value) => {
      const timeoutId = setTimeout(() => {
        navigate({
          search: (prev) => ({
            ...prev,
            ...value,
          }),
          replace: true,
        });
      }, 300);
      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [form, navigate]);

  // Sync state back to form fields if URL changes (e.g. Back/Forward navigation)
  useEffect(() => {
    form.reset(
      {
        search: searchParams.search || "",
        status: searchParams.status,
        priority: searchParams.priority,
      },
      { keepDefaultValues: true },
    );
  }, [searchParams, form]);

  // Client-side filtering
  console.log(`[DEBUG:UI] Tickets Queue rendered. Total tickets in Redux:`, tickets);
  const filteredList = useMemo(() => {
    return tickets.filter((ticket) => {
      const displaySubject = (ticket as Ticket & { title?: string }).title || ticket.subject || "";
      const displaySequenceId = ticket.ticketSequenceId || ticket.id || "";
      const matchSearch =
        !searchParams.search ||
        (displaySubject + " " + displaySequenceId)
          .toLowerCase()
          .includes(searchParams.search.toLowerCase());
      const matchStatus = !searchParams.status || ticket.status === searchParams.status;
      const matchPriority = !searchParams.priority || ticket.priority === searchParams.priority;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [tickets, searchParams]);

  useHeaderSetup(
    {
      title: "Tickets",
      subtitle: `${filteredList.length} matching`,
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

  // Helper for technician initials
  const getInitials = (name: string | null) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-24 flex flex-col w-full max-w-md mx-auto">
        {/* Controlled Search Form */}
        <div className="px-4 mt-2">
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

        {/* Status Tabs mapped to Hook Form */}
        <div className="mt-4 px-4 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabClick(t.key)}
              type="button"
              className={`shrink-0 px-4 h-9 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
                activeTab === t.key
                  ? "bg-primary text-primary-foreground shadow-elevated"
                  : "bg-secondary text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ========================================= */}
        {/* 4. HIGH-PERFORMANCE CARD PRESENTATION     */}
        {/* ========================================= */}
        <div className="px-4 mt-4 pb-30 flex flex-col gap-3 flex-1">
          {filteredList.map((ticket) => {
            const priorityBadge = getPriorityBadgeClass(ticket.priority);
            const statusBadge = getStatusBadgeClass(ticket.status);
            const sla = formatSLAWithCountdown(ticket.slaDeadline);

            return (
              <Link
                key={ticket.id}
                to="/tickets/$id"
                params={{ id: ticket.id }}
                className={`block rounded-2xl bg-card border border-border border-l-4 p-4 shadow-sm hover:shadow-soft active:scale-[0.99] transition-all hover:translate-y-[-1px] min-h-[48px] ${
                  ticket.priority === "critical" || ticket.priority === "urgent"
                    ? "border-l-destructive"
                    : ticket.priority === "high"
                      ? "border-l-[oklch(0.6_0.22_40)]"
                      : ticket.priority === "medium"
                        ? "border-l-warning"
                        : "border-l-muted-foreground/30"
                }`}
              >
                {/* Header Panel */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">
                      {ticket.ticketSequenceId || ticket.id.slice(0, 10)}
                    </span>
                    <span className="text-muted-foreground/45 text-[10px]">•</span>
                    <div className="flex items-center gap-1 text-[10.5px] font-bold text-muted-foreground">
                      <span>{ticket.category || "General"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full ${statusBadge} capitalize`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span
                      className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full ${priorityBadge.bg} ${priorityBadge.text} flex items-center gap-1 capitalize`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${priorityBadge.dot}`} />
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                {/* Subject */}
                <p className="mt-2.5 text-[12.5px] font-semibold tracking-tight text-foreground leading-snug">
                  {(ticket as Ticket & { title?: string }).title || ticket.subject}
                </p>

                {/* Description Snippet */}
                {ticket.description && (
                  <p className="mt-1 text-[12.5px] text-muted-foreground line-clamp-1 font-medium">
                    {ticket.description}
                  </p>
                )}

                {/* SLA Timer Deck & Date */}
                <div className="mt-3.5 pt-3.5 border-t border-border flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-medium">
                      Created {formatUSDateTime(ticket.createdAt)}
                    </span>

                    {/* Technician Assignee Profile */}
                    {ticket.assignedToName ? (
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold border border-primary/20">
                          {getInitials(ticket.assignedToName)}
                        </div>
                        <span className="text-[11px] text-muted-foreground font-semibold">
                          {ticket.assignedToName}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {ticket.slaDeadline && (
                    <div
                      className={`flex items-center gap-1.5 text-[11px] font-bold w-fit px-2 py-0.5 rounded-full ${
                        sla.isBreached
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      <span>{sla.text}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

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
                      search: () => ({}),
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

      <Link
        to="/tickets/new"
        className="fixed z-50 bottom-24 right-5 h-14 w-14 rounded-full bg-gradient-brand text-primary-foreground shadow-elevated hover:shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer min-h-[48px]"
        style={{ left: "calc(50% + 220px - 76px)" }}
      >
        <Plus className="h-6 w-6" />
      </Link>

      <BottomNav />
    </MobileShell>
  );
}
