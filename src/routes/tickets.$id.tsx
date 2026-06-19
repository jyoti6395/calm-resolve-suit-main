import { createFileRoute } from "@tanstack/react-router";
import { TicketDetailView } from "@/features/tickets/components/TicketDetailView";
import { DesktopTicketDetailView } from "@/features/tickets/components/DesktopTicketDetailView";
import { useIsMobile } from "@/hooks/use-mobile";

function TicketIdRoute() {
  const { id } = Route.useParams();
  const isMobile = useIsMobile();

  return isMobile ? <TicketDetailView id={id} /> : <DesktopTicketDetailView id={id} />;
}

export const Route = createFileRoute("/tickets/$id")({
  component: TicketIdRoute,
});
