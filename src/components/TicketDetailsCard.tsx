import { Ticket } from "../types/store";

interface TicketDetailsCardProps {
  ticket: Ticket;
}

export function TicketDetailsCard({ ticket }: TicketDetailsCardProps) {
  return (
    <div className="mb-6 p-4 rounded-xl bg-card border border-border">
      <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Ticket Details
      </h2>
      <div className="space-y-1">
        <p className="text-[13px]">
          <strong>Status:</strong>{" "}
          <span className="capitalize">{ticket.status.replace("_", " ")}</span>
        </p>
        <p className="text-[13px]">
          <strong>Priority:</strong> <span className="capitalize">{ticket.priority}</span>
        </p>
        {ticket.assignedToName && (
          <p className="text-[13px]">
            <strong>Assigned To:</strong> {ticket.assignedToName}
          </p>
        )}
        {ticket.description && (
          <p className="text-[13px] mt-2 pt-2 border-t border-border">{ticket.description}</p>
        )}
      </div>
    </div>
  );
}
