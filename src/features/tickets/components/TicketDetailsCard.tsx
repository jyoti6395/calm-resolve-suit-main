import type { Ticket } from "@/types/store";
import { User, Calendar, Tag, AlertCircle, Image as ImageIcon, FileText } from "lucide-react";

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
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-border space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Attachments ({ticket.attachments.length})
            </span>
            <div className="flex flex-col gap-1.5">
              {ticket.attachments.map((file, idx) => {
                const isImage =
                  file.type === "photo" || file.name.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                const FileIcon = isImage ? ImageIcon : FileText;
                return (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 active:scale-[0.99] transition-all border border-border/60 text-[12.5px] font-semibold text-foreground truncate cursor-pointer"
                  >
                    <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate flex-1 pr-1 hover:underline">{file.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
