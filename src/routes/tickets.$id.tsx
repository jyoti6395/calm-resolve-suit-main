import { createFileRoute } from "@tanstack/react-router";
import { TicketDetailView } from "@/features/tickets/components/TicketDetailView";

function TicketIdRoute() {
  const { id } = Route.useParams();
  return <TicketDetailView id={id} />;
}

export const Route = createFileRoute("/tickets/$id")({
  component: TicketIdRoute,
});
