import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { useHeaderSetup } from "@/components/HeaderContext";
import { useTicketWorkspace } from "@/hooks/useTicketWorkspace";
import { MessageTimeline } from "@/components/MessageTimeline";
import { MessageInputForm } from "@/components/MessageInputForm";

export const Route = createFileRoute("/tickets/$id")({
  component: TicketWorkspace,
});

function TicketWorkspace() {
  const { id } = Route.useParams();
  const { ticket, messages, user, sendMessage } = useTicketWorkspace(id);

  useHeaderSetup(
    {
      title: ticket?.subject || "Ticket Details",
      subtitle: ticket?.id || id || "",
      back: true,
    },
    [ticket?.subject, ticket?.id],
  );

  return (
    <MobileShell scrollable={false}>
      {/* Mobile WebView Guardrail constraints */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden w-full max-w-md mx-auto md:max-w-4xl bg-background">
        <MessageTimeline ticket={ticket} messages={messages} currentUserUid={user?.uid} />
        <MessageInputForm onSendMessage={sendMessage} />
      </div>
    </MobileShell>
  );
}
