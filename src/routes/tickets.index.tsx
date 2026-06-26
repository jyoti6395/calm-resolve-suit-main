import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { TicketQueue } from "@/features/tickets/components/TicketQueue";
import { DesktopTicketHub } from "@/features/tickets/components/DesktopTicketHub";
import { DesktopPageShell } from "@/components/layout/DesktopPageShell";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

const ticketsSearchSchema = z.object({
  status: z.enum(["all", "open", "in_progress", "resolved", "closed"]).optional().default("all"),
  search: z.string().optional(),
  priority: z.string().optional(),
  page: z.number().catch(1).optional(),
  sortBy: z.enum(["newest", "oldest", "priority"]).optional(),
});

function TicketsIndexRoute() {
  const isMobile = useIsMobile();
  const searchParams = Route.useSearch();

  // ─── DESKTOP — render DesktopTicketHub ───────────────────────
  if (!isMobile) {
    return (
      <DesktopPageShell>
        <div className="flex flex-row items-center justify-between mb-7 mt-4 gap-4">
          <div>
            <h1 className="text-[28px] font-extrabold text-foreground tracking-tight leading-tight">
              Tickets
            </h1>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Manage and resolve customer support inquiries.
            </p>
          </div>
          <Link
            to="/tickets/new"
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-brand text-primary-foreground font-semibold text-[14px] shadow-elevated hover:shadow-glow transition-all shrink-0 ml-6"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Link>
        </div>
        <DesktopTicketHub searchParams={searchParams} />
      </DesktopPageShell>
    );
  }

  // ─── MOBILE — render TicketQueue exactly as before (no changes) ───────────
  return <TicketQueue searchParams={searchParams} />;
}

export const Route = createFileRoute("/tickets/")({
  validateSearch: (search) => ticketsSearchSchema.parse(search),
  component: TicketsIndexRoute,
});
