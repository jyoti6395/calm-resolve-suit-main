import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, SlidersHorizontal, Plus, Clock } from "lucide-react";

import { useAppSelector } from "@/store/hooks";
import { formatUSDateTime } from "@/lib/formatters";
import { useIsMobile } from "@/hooks/use-mobile";

import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { AppHeader } from "@/components/AppHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TicketStatus, TicketPriority } from "@/store/ticketSlice";

// =========================================
// 1. URL SEARCH STATE PARAMETERS SCHEMA (ZOD)
// =========================================
const ticketSearchSchema = z.object({
  search: z.string().catch("").optional(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  page: z.number().catch(1).optional(),
});

export const Route = createFileRoute("/tickets/")({
  component: TicketsQueue,
  validateSearch: (search) => ticketSearchSchema.parse(search),
});

// Styling maps for enterprise strict types
const priorityStyles: Record<
  TicketPriority,
  { bg: string; text: string; dot: string; label: string }
> = {
  low: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground", label: "Low" },
  medium: { bg: "bg-warning/15", text: "text-warning", dot: "bg-warning", label: "Medium" },
  high: {
    bg: "bg-[oklch(0.7_0.18_45)/15%]",
    text: "text-[oklch(0.55_0.22_40)]",
    dot: "bg-[oklch(0.6_0.22_40)]",
    label: "High",
  },
  urgent: {
    bg: "bg-destructive/12",
    text: "text-destructive",
    dot: "bg-destructive",
    label: "Urgent",
  },
};

const statusStyles: Record<TicketStatus, { bg: string; text: string; label: string }> = {
  open: { bg: "bg-primary/10", text: "text-primary", label: "Open" },
  in_progress: { bg: "bg-warning/15", text: "text-warning", label: "In Progress" },
  resolved: { bg: "bg-success/15", text: "text-success", label: "Resolved" },
  closed: { bg: "bg-muted", text: "text-muted-foreground", label: "Closed" },
};

function CategoryIcon({ category }: { category: string }) {
  const map: Record<string, string> = {
    Network: "🌐",
    Email: "✉️",
    Hardware: "🖥️",
    Access: "🔑",
    Software: "💿",
    Infrastructure: "⚙️",
    Compliance: "🛡️",
  };
  return (
    <span className="h-7 w-7 rounded-xl bg-secondary flex items-center justify-center text-[14px] shrink-0">
      {map[category] ?? "✨"}
    </span>
  );
}

function TicketsQueue() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const isMobile = useIsMobile();
  const { tickets } = useAppSelector((state) => state.tickets);

  // =========================================
  // 2. NON-BLOCKING FORMS PATTERN (REACT-HOOK-FORM)
  // =========================================
  const form = useForm<z.infer<typeof ticketSearchSchema>>({
    resolver: zodResolver(ticketSearchSchema),
    defaultValues: {
      search: searchParams.search || "",
      status: searchParams.status,
      priority: searchParams.priority,
      page: searchParams.page || 1,
    },
  });

  // Debounce search input to URL state
  useEffect(() => {
    const subscription = form.watch((value) => {
      const timeoutId = setTimeout(() => {
        navigate({
          search: (prev) => ({
            ...prev,
            ...value,
            // Reset to page 1 on filter changes
            page: 1,
          }),
          replace: true,
        });
      }, 300);
      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [form, navigate]);

  // =========================================
  // 3. PERFORMANCE DATA INTERFACE LAYOUT
  // =========================================
  const filteredList = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        !searchParams.search ||
        (t.title + " " + t.id + " " + t.category)
          .toLowerCase()
          .includes(searchParams.search.toLowerCase());
      const matchStatus = !searchParams.status || t.status === searchParams.status;
      const matchPriority = !searchParams.priority || t.priority === searchParams.priority;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [tickets, searchParams]);

  const tabs: { key: "all" | TicketStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "in_progress", label: "In Progress" },
    { key: "resolved", label: "Resolved" },
    { key: "closed", label: "Closed" },
  ];

  const handleTabClick = (key: "all" | TicketStatus) => {
    if (key === "all") {
      form.setValue("status", undefined);
    } else {
      form.setValue("status", key);
    }
  };

  const activeTab = form.watch("status") || "all";

  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-32">
        <AppHeader
          title="Tickets"
          subtitle={`${filteredList.length} matching`}
          right={
            <button className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          }
        />

        {/* Controlled Search Form */}
        <div className="px-5">
          <form onSubmit={(e) => e.preventDefault()}>
            <label className="flex items-center gap-2 h-12 px-4 rounded-2xl bg-secondary focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all border border-transparent">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                {...form.register("search")}
                placeholder="Search by ID, title, category…"
                className="flex-1 bg-transparent outline-none text-[14px] w-full text-foreground placeholder:text-muted-foreground/50"
              />
            </label>
          </form>
        </div>

        {/* Status Tabs mapped to Hook Form */}
        <div className="mt-4 px-5 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabClick(t.key)}
              type="button"
              className={`shrink-0 px-4 h-9 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                activeTab === t.key
                  ? "bg-primary text-primary-foreground shadow-elevated"
                  : "bg-secondary text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-5 mt-4">
          {/* Responsive Guardrail: Mobile Cards vs Desktop Table */}
          {isMobile ? (
            <div className="space-y-3 w-full max-w-md mx-auto">
              {filteredList.map((t) => {
                const ps = priorityStyles[t.priority];
                const ss = statusStyles[t.status];
                return (
                  <Link
                    key={t.id}
                    to="/tickets/$id"
                    params={{ id: t.id }}
                    className="block rounded-2xl bg-card border border-border p-4 shadow-soft active:scale-[0.99] transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={t.category} />
                        <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                          {t.id.slice(0, 8)}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ss.bg} ${ss.text}`}
                      >
                        {ss.label}
                      </span>
                    </div>
                    <p className="mt-2 text-[14.5px] font-semibold leading-snug text-foreground">
                      {t.title}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ps.bg} ${ps.text} flex items-center gap-1`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${ps.dot}`} />
                          {ps.label}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Created {formatUSDateTime(t.createdAt)}</span>
                      <span className="flex items-center gap-1 font-semibold text-foreground/70">
                        <Clock className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
              {filteredList.length === 0 && (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  No tickets match your search.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border bg-card shadow-soft overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredList.map((t) => {
                    const ps = priorityStyles[t.priority];
                    const ss = statusStyles[t.status];
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium text-[12px] uppercase tracking-wider text-muted-foreground">
                          <Link to="/tickets/$id" params={{ id: t.id }} className="hover:underline">
                            {t.id.slice(0, 8)}
                          </Link>
                        </TableCell>
                        <TableCell className="font-semibold">{t.title}</TableCell>
                        <TableCell>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ss.bg} ${ss.text}`}
                          >
                            {ss.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ps.bg} ${ps.text} inline-flex items-center gap-1`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${ps.dot}`} />
                            {ps.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-[12px] text-muted-foreground">
                          {formatUSDateTime(t.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No tickets match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <Link
        to="/tickets/new"
        className="fixed z-50 bottom-24 right-5 h-14 w-14 rounded-full bg-gradient-brand text-primary-foreground shadow-elevated hover:shadow-glow flex items-center justify-center cursor-pointer"
        style={{ left: "calc(50% + 220px - 76px)" }}
      >
        <Plus className="h-6 w-6" />
      </Link>

      <BottomNav />
    </MobileShell>
  );
}
