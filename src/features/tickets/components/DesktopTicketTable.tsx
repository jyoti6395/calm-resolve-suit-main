import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import type { Ticket } from "@/types/store";
import { Button } from "@/components/ui/button";

export function DesktopTicketTable({
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

  const paginatedList = useMemo(() => {
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredList, safePage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
      replace: true,
    });
  };

  // Helper for relative time to match mockup (e.g., "10 mins ago")
  const getRelativeTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs) || diffMs < 0) return "just now";

    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} mins ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm flex flex-col mt-4">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-border bg-transparent">
              <th className="px-6 py-3 text-[13px] font-semibold text-muted-foreground whitespace-nowrap min-w-[160px] w-[180px]">
                Ticket ID
              </th>
              <th className="px-6 py-3 text-[13px] font-semibold text-muted-foreground min-w-[300px]">
                Subject & Requester
              </th>
              <th className="px-6 py-3 text-[13px] font-semibold text-muted-foreground whitespace-nowrap w-[140px]">
                Priority
              </th>
              <th className="px-6 py-3 text-[13px] font-semibold text-muted-foreground whitespace-nowrap w-[140px]">
                Status
              </th>
              <th className="px-6 py-3 text-[13px] font-semibold text-muted-foreground whitespace-nowrap w-[200px]">
                Assigned To
              </th>
              <th className="px-6 py-3 text-[13px] font-semibold text-muted-foreground whitespace-nowrap w-[150px]">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedList.map((t) => {
              // Extract UI properties
              const displayId = t.ticketSequenceId
                ? `#${t.ticketSequenceId}`
                : `#TK-${t.id.slice(0, 5).toUpperCase()}`;
              const subject = (t as Ticket & { title?: string }).title || t.subject;
              const requesterName = t.requesterName || "Sarah Jenkins"; // Fallback for mockup realism
              const requesterCompany =
                t.requesterEmail?.split("@")[1]?.split(".")[0] || "TechCorp Inc.";

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

              // Priority Badge Styles (Image 2 specifically uses Red/Blue/Gray)
              let priorityClasses = "bg-slate-100 text-slate-600";
              let priorityText = "LOW";
              if (t.priority === "critical" || t.priority === "urgent" || t.priority === "high") {
                priorityClasses = "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
                priorityText = "HIGH";
              } else if (t.priority === "medium") {
                priorityClasses =
                  "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
                priorityText = "MEDIUM";
              }

              // Status Dot Style
              let statusDot = "bg-slate-400";
              if (t.status === "open") statusDot = "bg-red-500";
              else if (t.status === "in_progress") statusDot = "bg-blue-600";
              else if (t.status === "resolved" || t.status === "closed")
                statusDot = "bg-slate-400 border-2 border-slate-400 bg-transparent"; // Checkmark icon approximation via border for resolved

              return (
                <tr
                  key={t.id}
                  onClick={() => navigate({ to: "/tickets/$id", params: { id: t.id } })}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                >
                  {/* Ticket ID */}
                  <td className="px-6 py-2.5 align-middle">
                    <span className="text-[14px] font-medium text-slate-400 group-hover:text-primary transition-colors">
                      {displayId}
                    </span>
                  </td>

                  {/* Subject & Requester */}
                  <td className="px-6 py-2.5 align-middle">
                    <p className="text-[15px] font-semibold text-foreground tracking-tight leading-snug">
                      {subject}
                    </p>
                    <p className="text-[13px] text-muted-foreground mt-1">
                      {requesterName} <span className="text-muted-foreground/60 px-1">•</span>{" "}
                      {requesterCompany}
                    </p>
                  </td>

                  {/* Priority */}
                  <td className="px-6 py-2.5 align-middle">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${priorityClasses}`}
                    >
                      {priorityText}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-2.5 align-middle">
                    <div className="flex items-center gap-2 text-[14px] font-medium text-foreground capitalize">
                      {t.status === "resolved" ? (
                        <div className="h-3.5 w-3.5 rounded-full border-[1.5px] border-emerald-500 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </div>
                      ) : (
                        <span className={`h-2.5 w-2.5 rounded-full ${statusDot}`} />
                      )}
                      <span className={t.status === "resolved" ? "text-muted-foreground" : ""}>
                        {t.status.replace("_", " ")}
                      </span>
                    </div>
                  </td>

                  {/* Assigned To */}
                  <td className="px-6 py-2.5 align-middle">
                    {t.assignedToName ? (
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                          {techInitials}
                        </div>
                        <span className="text-[14px] font-medium text-foreground">
                          {t.assignedToName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[14px] text-muted-foreground italic">Unassigned</span>
                    )}
                  </td>

                  {/* Last Updated */}
                  <td className="px-6 py-2.5 align-middle">
                    <span className="text-[14px] text-muted-foreground">
                      {getRelativeTime(t.updatedAt || t.createdAt)}
                    </span>
                  </td>
                </tr>
              );
            })}

            {filteredList.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4">
                      <SlidersHorizontal className="h-5 w-5 text-muted-foreground/60" />
                    </div>
                    <h3 className="text-[16px] font-bold text-foreground">No tickets found</h3>
                    <p className="mt-1 text-[13.5px] text-muted-foreground max-w-[260px] leading-normal">
                      We couldn't find any tickets matching your selected filters.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination */}
      {filteredList.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <span className="text-[14px] text-muted-foreground">
            Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(safePage * ITEMS_PER_PAGE, filteredList.length)} of {filteredList.length}{" "}
            tickets
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted"
              disabled={safePage === 1}
              onClick={() => handlePageChange(safePage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Simple pagination numbers for mockup */}
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              const isActive = safePage === pageNum;
              return (
                <Button
                  key={pageNum}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-8 w-8 rounded-full text-[13px] font-medium ${
                    isActive
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 3 && <span className="px-1 text-muted-foreground">...</span>}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted"
              disabled={safePage === totalPages}
              onClick={() => handlePageChange(safePage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
