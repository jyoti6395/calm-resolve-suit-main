import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, SlidersHorizontal, Plus, Clock, AlertTriangle } from "lucide-react";

import { useAppSelector } from "@/store/hooks";
import {
  formatUSDateTime,
  formatSLAWithCountdown,
  getStatusBadgeClass,
  getPriorityBadgeClass,
} from "@/lib/formatters";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { AppHeader } from "@/components/AppHeader";
import type { Ticket } from "@/types/store";

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

  // =========================================
  // 2. ZERO CODES overhead (DESKTOP ELIMINATION)
  // =========================================
  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-24 flex flex-col w-full max-w-md mx-auto">
        <AppHeader
          title="Tickets"
          subtitle={`${filteredList.length} matching`}
          right={
            <button className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center cursor-pointer hover:bg-muted transition-colors shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          }
        />

        {/* Controlled Search Form */}
        <div className="px-4 mt-2">
          <form onSubmit={(e) => e.preventDefault()}>
            <label className="flex items-center gap-2 h-12 px-4 rounded-2xl bg-secondary focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all border border-transparent">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                {...form.register("search")}
                placeholder="Search by ID, subject…"
                className="flex-1 bg-transparent outline-none text-[15px] w-full text-foreground placeholder:text-muted-foreground/50"
              />
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
        <div className="px-4 mt-4 flex flex-col gap-3">
          {filteredList.map((ticket) => {
            const priorityBadge = getPriorityBadgeClass(ticket.priority);
            const statusBadge = getStatusBadgeClass(ticket.status);
            const sla = formatSLAWithCountdown(ticket.slaDeadline);

            return (
              <Link
                key={ticket.id}
                to="/tickets/$id"
                params={{ id: ticket.id }}
                className="block rounded-2xl bg-card border border-border p-4 shadow-sm active:scale-[0.99] transition-transform min-h-[48px]"
              >
                {/* Header Panel */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">
                    {ticket.ticketSequenceId || ticket.id.slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge} capitalize`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityBadge.bg} ${priorityBadge.text} flex items-center gap-1 capitalize`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${priorityBadge.dot}`} />
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                {/* Subject */}
                <p className="mt-2 text-[15px] font-bold tracking-tight text-foreground leading-snug">
                  {(ticket as Ticket & { title?: string }).title || ticket.subject}
                </p>

                {/* SLA Timer Deck & Date */}
                <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Created {formatUSDateTime(ticket.createdAt)}</span>
                    <span className="flex items-center gap-1 font-semibold text-foreground/70">
                      <Clock className="h-3 w-3" />
                    </span>
                  </div>

                  {ticket.slaDeadline && (
                    <div
                      className={`flex items-center gap-1 text-[11px] font-bold ${sla.isBreached ? "text-destructive" : "text-warning"}`}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      <span>{sla.text}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          {filteredList.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-[14px]">
              No tickets match your filters.
            </div>
          )}
        </div>
      </div>

      <Link
        to="/tickets/new"
        className="fixed z-50 bottom-24 right-5 h-14 w-14 rounded-full bg-gradient-brand text-primary-foreground shadow-elevated hover:shadow-glow flex items-center justify-center cursor-pointer min-h-[48px]"
        style={{ left: "calc(50% + 220px - 76px)" }}
      >
        <Plus className="h-6 w-6" />
      </Link>

      <BottomNav />
    </MobileShell>
  );
}
