import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import type { Ticket, Message } from "@/types/store";
import { formatUSDateTime } from "@/lib/formatters";
import { TicketDetailsCard } from "./TicketDetailsCard";

interface MessageTimelineProps {
  ticket: Ticket | null;
  messages: Message[];
  currentUserUid?: string;
}

export function MessageTimeline({ ticket, messages, currentUserUid }: MessageTimelineProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to bottom when messages array changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
      {/* Ticket Details Panel if available */}
      {ticket && <TicketDetailsCard ticket={ticket} />}

      {/* Conversational Timeline */}

      {messages.map((msg) => {
        const isMe = msg.senderId === currentUserUid;
        return (
          <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[85%] p-3 shadow-sm ${
                isMe
                  ? "bg-gradient-brand text-primary-foreground rounded-2xl rounded-tr-sm"
                  : "bg-secondary text-foreground rounded-2xl rounded-tl-sm border border-border"
              }`}
            >
              {!isMe && msg.senderName && (
                <p className="text-[10.5px] font-bold opacity-70 mb-1 uppercase tracking-wider">
                  {msg.senderName}
                </p>
              )}
              <p className="text-[14px] leading-relaxed">{msg.content}</p>
            </div>
            {msg.createdAt && (
              <span className="text-[10.5px] font-medium text-muted-foreground mt-1 px-1">
                {formatUSDateTime(msg.createdAt)}
              </span>
            )}
          </div>
        );
      })}

      {/* Persistent React useRef pointing to anchor node at bottom */}
      <div ref={messagesEndRef} className="h-2" />
    </div>
  );
}
