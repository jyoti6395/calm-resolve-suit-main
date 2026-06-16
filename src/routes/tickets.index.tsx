import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { TicketQueue } from "@/features/tickets/components/TicketQueue";

const ticketsSearchSchema = z.object({
  status: z.enum(["all", "open", "in_progress", "resolved", "closed"]).optional().default("all"),
  search: z.string().optional(),
  priority: z.string().optional(),
});

function TicketsIndexRoute() {
  const searchParams = Route.useSearch();
  return <TicketQueue searchParams={searchParams} />;
}

export const Route = createFileRoute("/tickets/")({
  validateSearch: (search) => ticketsSearchSchema.parse(search),
  component: TicketsIndexRoute,
});
