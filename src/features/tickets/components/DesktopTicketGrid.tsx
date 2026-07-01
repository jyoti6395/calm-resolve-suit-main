import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { SlidersHorizontal, RefreshCcw } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import type { Ticket } from "@/types/store";
import { Button } from "@/components/ui/button";

export function DesktopTicketGrid({
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

  // Ensure current page is valid
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  // For the grid view, "Load More" usually appends items. But since we are using URL state
  // for pagination, we'll just show items up to the current page.
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

  // Helper for relative time
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
    if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex flex-col flex-1 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedList.map((t) => {
          // Extract UI properties
          const displayId = t.ticketSequenceId || `TK-${t.id.slice(0, 5).toUpperCase()}`;
          const subject = (t as Ticket & { title?: string }).title || t.subject;

          // Technician matching
          const tech = technicians.find(
            (tech) => tech.name === t.assignedToName || tech.uid === t.assignedToId,
          );
          const techInitials = t.assignedToName
            ? t.assignedToName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "??";

          // Priority Badge Styles (Image 1 uses text and alert icons)
          let priorityClasses = "bg-slate-100 text-slate-600";
          let priorityText = "LOW";
          let PriorityIcon = null;

          if (t.priority === "critical" || t.priority === "urgent" || t.priority === "high") {
            priorityClasses = "bg-red-50 text-red-600 border border-red-100";
            priorityText = "HIGH";
            PriorityIcon = () => <span className="font-bold mr-1">!</span>;
          } else if (t.priority === "medium") {
            priorityClasses = "bg-blue-50 text-blue-600 border border-blue-100";
            priorityText = "MEDIUM";
            PriorityIcon = () => <span className="font-bold mr-1">—</span>;
          } else {
            priorityClasses = "bg-slate-50 text-slate-600 border border-slate-200";
            priorityText = "LOW";
            PriorityIcon = () => <span className="font-bold mr-1">⌄</span>;
          }

          // Status Badge Style
          let statusClasses = "bg-slate-100 text-slate-700";
          let statusDot = "bg-slate-400";
          let progressWidth = "w-1/4";
          let progressColor = "bg-slate-300";

          if (t.status === "open") {
            statusClasses = "bg-slate-100 text-slate-800";
            statusDot = "bg-red-500";
            progressWidth = "w-[10%]";
            progressColor = "bg-red-500";
          } else if (t.status === "in_progress") {
            statusClasses = "bg-blue-50 text-blue-700 border border-blue-100";
            statusDot = "bg-transparent"; // Handled by icon usually, but using dot for fallback
            progressWidth = "w-[60%]";
            progressColor = "bg-blue-600";
          } else if (t.status === "resolved") {
            statusClasses = "bg-emerald-50 text-emerald-700 border border-emerald-100";
            statusDot = "bg-transparent";
            progressWidth = "w-full";
            progressColor = "bg-emerald-500";
          }

          return (
            <Link
              key={t.id}
              to="/tickets/$id"
              params={{ id: t.id }}
              className="group flex flex-col justify-between rounded-2xl bg-card border border-border p-6 shadow-sm hover:shadow-md transition-all h-[240px]"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-bold text-slate-500 tracking-wide uppercase">
                      {displayId}
                    </span>
                    <span
                      className={`flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase ${priorityClasses}`}
                    >
                      {PriorityIcon && <PriorityIcon />}
                      {priorityText}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold capitalize ${statusClasses}`}
                  >
                    {t.status === "resolved" ? (
                      <div className="h-3.5 w-3.5 rounded-full border-[1.5px] border-emerald-600 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      </div>
                    ) : t.status === "in_progress" ? (
                      <RefreshCcw className="h-3 w-3 text-blue-600" />
                    ) : (
                      <span className={`h-2 w-2 rounded-full ${statusDot}`} />
                    )}
                    <span>{t.status.replace("_", " ")}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-[18px] font-bold text-foreground leading-snug line-clamp-2 mb-2">
                  {subject}
                </h3>
                <p className="text-[13.5px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {t.description ||
                    "No description provided for this ticket. Click to view full details and conversation history."}
                </p>
              </div>

              {/* Footer Section */}
              <div className="mt-4">
                {/* Progress Bar (if not closed) */}
                {t.status !== "closed" && (
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-5">
                    <div className={`h-full rounded-full ${progressColor} ${progressWidth}`} />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {/* Assignee */}
                  <div className="flex items-center gap-3">
                    {t.assignedToName ? (
                      <>
                        <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                          {techInitials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] text-muted-foreground font-medium">
                            Assigned to
                          </span>
                          <span className="text-[13px] font-bold text-foreground leading-none mt-0.5">
                            {t.assignedToName}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted border border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground">
                          +
                        </div>
                        <span className="text-[13px] font-medium text-primary">Assign to me</span>
                      </div>
                    )}
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                    <RefreshCcw className="h-3.5 w-3.5 opacity-70" />
                    <span>{getRelativeTime(t.updatedAt || t.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border shadow-sm">
          <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <h3 className="text-[16px] font-bold text-foreground">No tickets found</h3>
          <p className="mt-1 text-[13.5px] text-muted-foreground max-w-[260px] text-center leading-normal">
            We couldn't find any tickets matching your selected filters.
          </p>
        </div>
      )}

      {safePage < totalPages && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-muted text-foreground font-bold text-[13px] hover:bg-secondary transition-colors border border-border shadow-sm"
          >
            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
            Load More Tickets
          </Button>
        </div>
      )}
    </div>
  );
}
