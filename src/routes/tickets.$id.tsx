import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  doc,
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { updateTicket } from "@/store/ticketSlice";
import { sanitizeQuerySnapshot, formatUSDateTime, serializeTimestamp } from "@/lib/formatters";
import { MobileShell } from "@/components/MobileShell";
import { AppHeader } from "@/components/AppHeader";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { Ticket, Message } from "@/types/store";
import { toast } from "sonner";

export const Route = createFileRoute("/tickets/$id")({
  component: TicketWorkspace,
});

const messageSchema = z.object({
  content: z.string().min(1, "Cannot send an empty message").max(500),
});

type MessageInput = z.infer<typeof messageSchema>;

function TicketWorkspace() {
  const { id } = Route.useParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<MessageInput>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Dual Real-Time Subscriptions
  useEffect(() => {
    // Stream 1: Ticket Metadata
    const unsubscribeTicket = onSnapshot(doc(db, "tickets", id), (snapshot) => {
      if (snapshot.exists()) {
        const ticketData = { id: snapshot.id, ...snapshot.data() } as Ticket;
        setTicket(ticketData);
        // Dispatch snapshot data to update local store matrix
        if (updateTicket) {
          dispatch(updateTicket(ticketData));
        }
      }
    });

    // Stream 2: Conversational Timeline
    const messagesQuery = query(
      collection(db, "tickets", id, "messages"),
      where("type", "==", "public"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = sanitizeQuerySnapshot<Message>(snapshot);
      setMessages(msgs);
    });

    // Leak Mitigation: cleanup WebSockets
    return () => {
      unsubscribeTicket();
      unsubscribeMessages();
    };
  }, [id, dispatch]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!ticket || !user) return;
    const newStatus = e.target.value;

    try {
      const ticketRef = doc(db, "tickets", ticket.id);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: serializeTimestamp(new Date()),
      });

      // Construct status change notification
      const isResolved = newStatus === "resolved";
      const statusText = newStatus.replace("_", " ");
      const statusNotif = {
        title: isResolved ? "Ticket resolved" : "Ticket status updated",
        body: `Your ticket "${ticket.subject}" status has been updated to "${statusText}".`,
        tone: isResolved ? ("success" as const) : ("warning" as const),
        createdAt: new Date().toISOString(),
        userId: ticket.createdBy || "",
        read: false,
      };

      try {
        await addDoc(collection(db, "notifications"), statusNotif);
      } catch (err) {
        console.warn("Failed to write status notification to root, trying subcollection...", err);
        try {
          if (ticket.createdBy) {
            await addDoc(collection(db, "users", ticket.createdBy, "notifications"), statusNotif);
          }
        } catch (subErr) {
          console.error("Failed to save status notification in both locations:", subErr);
        }
      }

      toast.success(`Ticket status updated to ${statusText}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status.");
    }
  };

  const onSubmit = async (data: MessageInput) => {
    if (!user) return;

    const payload = {
      content: data.content,
      ticketId: id,
      senderId: user.uid,
      senderName: user.displayName || user.email || "Technician",
      type: "public",
      createdAt: serializeTimestamp(new Date()),
    };

    try {
      await addDoc(collection(db, "tickets", id, "messages"), payload);

      // Determine message notification recipient
      const recipientId = user.uid === ticket?.createdBy ? ticket?.assignedToId : ticket?.createdBy;

      if (recipientId) {
        const replyNotif = {
          title: `New reply on ${ticket?.subject || "ticket"}`,
          body: `${payload.senderName}: ${payload.content}`,
          tone: "primary" as const,
          createdAt: new Date().toISOString(),
          userId: recipientId,
          read: false,
        };

        try {
          await addDoc(collection(db, "notifications"), replyNotif);
        } catch (err) {
          console.warn("Failed to write reply notification to root, trying subcollection...", err);
          try {
            await addDoc(collection(db, "users", recipientId, "notifications"), replyNotif);
          } catch (subErr) {
            console.error("Failed to save reply notification in both locations:", subErr);
          }
        }
      }

      reset(); // Reset input field instantly without triggering layout jitter
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <MobileShell scrollable={false}>
      {/* Mobile WebView Guardrail constraints */}
      <div className="h-full flex flex-col justify-between w-full bg-background">
        <AppHeader title={ticket?.subject || "Loading..."} back />

        {/* Scrollable Message Box */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {ticket && (
            <div className="mb-6 p-4 rounded-xl bg-card border border-border">
              <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Ticket Details
              </h2>
              <div className="space-y-2">
                <p className="text-[13px] flex items-center gap-1.5">
                  <strong>Status:</strong>{" "}
                  {user?.role === "super_admin" || user?.role === "technician" ? (
                    <select
                      value={ticket.status}
                      onChange={handleStatusChange}
                      className="bg-secondary text-foreground text-[12px] font-semibold rounded-lg px-2 py-0.5 border border-border outline-none cursor-pointer focus:border-primary transition-colors capitalize"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  ) : (
                    <span className="capitalize">{ticket.status.replace("_", " ")}</span>
                  )}
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
                  <p className="text-[13px] mt-2 pt-2 border-t border-border">
                    {ticket.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Conversational Timeline */}
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
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

        {/* Fixed Input Layer controlled via react-hook-form */}
        <div className="p-4 bg-background border-t border-border shrink-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex items-center gap-2 bg-secondary rounded-[24px] p-1 border border-border/50 focus-within:border-primary/50 transition-colors"
          >
            <input
              {...register("content")}
              placeholder="Type a message..."
              autoComplete="off"
              className="flex-1 bg-transparent px-4 py-2 outline-none text-[15px] font-medium"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="p-3 rounded-full bg-gradient-brand text-primary-foreground shrink-0 shadow-elevated disabled:opacity-40 transition-all hover:opacity-90 active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </MobileShell>
  );
}
