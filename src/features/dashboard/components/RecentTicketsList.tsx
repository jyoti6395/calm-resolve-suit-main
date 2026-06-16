import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { getStatusBadgeClass, getPriorityBadgeClass, formatUSDateTime } from "@/lib/formatters";
import type { Ticket } from "@/types/store";

export function RecentTicketsList({ tickets }: { tickets: Ticket[] }) {
  return (
    <>
      <div className="px-5 mt-7 flex items-center justify-between">
        <h2 className="text-[15px] font-bold">Recent tickets</h2>
        <Link
          to="/tickets"
          search={{ status: "all" }}
          className="text-[12px] text-primary font-semibold"
        >
          See all
        </Link>
      </div>
      <div className="px-5 mt-3 pb-30 space-y-2.5">
        {tickets.length === 0 ? (
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
          tickets.map((t) => (
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
  );
}
