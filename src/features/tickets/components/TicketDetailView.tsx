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
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { updateTicket } from "@/store/ticketSlice";
import { sanitizeQuerySnapshot, serializeTimestamp } from "@/lib/formatters";
import { MobileShell } from "@/components/layout/MobileShell";
import { AppHeader } from "@/components/layout/AppHeader";
import { MessageInputForm } from "@/features/tickets/components/MessageInputForm";
import type { Ticket, Message } from "@/types/store";
import { toast } from "sonner";
import { Clock, Check, MessageCircle, Phone, MoreVertical } from "lucide-react";

interface NotificationPayload {
  title: string;
  body: string;
  tone: "success" | "warning" | "primary" | "info";
  createdAt: string;
  userId: string;
  read: boolean;
}

async function saveNotification(recipientId: string, payload: NotificationPayload) {
  try {
    await addDoc(collection(db, "notifications"), payload);
  } catch (err) {
    console.warn("Failed to write notification to root, trying subcollection...", err);
    try {
      await addDoc(collection(db, "users", recipientId, "notifications"), payload);
    } catch (subErr) {
      console.warn(
        "Failed to save notification in both locations (muted permission error):",
        subErr,
      );
    }
  }
}

function formatTimeOnly(timestamp: Timestamp | Date | string | number | null | undefined): string {
  if (!timestamp) return "";
  let date: Date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (
    timestamp &&
    typeof timestamp === "object" &&
    "toDate" in timestamp &&
    typeof (timestamp as { toDate: () => Date }).toDate === "function"
  ) {
    date = (timestamp as { toDate: () => Date }).toDate();
  } else {
    date = new Date(timestamp as string | number | Date);
  }
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatMessageDate(
  timestamp: Timestamp | Date | string | number | null | undefined,
): string {
  if (!timestamp) return "";
  let date: Date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (
    timestamp &&
    typeof timestamp === "object" &&
    "toDate" in timestamp &&
    typeof (timestamp as { toDate: () => Date }).toDate === "function"
  ) {
    date = (timestamp as { toDate: () => Date }).toDate();
  } else {
    date = new Date(timestamp as string | number | Date);
  }
  if (isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function TicketDetailView({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);
  const { technicians } = useAppSelector((state) => state.technicians);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const isFirstLoad = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({
        behavior: isFirstLoad.current ? "auto" : "smooth",
      });
      isFirstLoad.current = false;
    }
  }, [messages]);

  useEffect(() => {
    if (authLoading || !user) return;

    const unsubscribeTicket = onSnapshot(
      doc(db, "tickets", id),
      (snapshot) => {
        if (snapshot.exists()) {
          const ticketData = { id: snapshot.id, ...snapshot.data() } as Ticket;
          setTicket(ticketData);
          if (updateTicket) {
            dispatch(updateTicket(ticketData));
          }
        }
      },
      (error) => {
        console.error("Ticket metadata subscription error:", error);
        if (error.code === "permission-denied") {
          toast.error("You don't have permission to access this ticket.");
        }
      },
    );

    const messagesQuery = query(
      collection(db, "tickets", id, "messages"),
      where("type", "==", "public"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribeMessages = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const msgs = sanitizeQuerySnapshot<Message>(snapshot);
        setMessages(msgs);
      },
      (error) => {
        console.error("Ticket messages subscription error:", error);
      },
    );

    return () => {
      unsubscribeTicket();
      unsubscribeMessages();
    };
  }, [id, dispatch, authLoading, user]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!ticket || !user) return;
    const newStatus = e.target.value;

    try {
      const ticketRef = doc(db, "tickets", ticket.id);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: serializeTimestamp(new Date()),
      });

      const isResolved = newStatus === "resolved";
      const statusText = newStatus.replace("_", " ");
      const statusNotif: NotificationPayload = {
        title: isResolved ? "Ticket resolved" : "Ticket status updated",
        body: `Your ticket "${ticket.subject}" status has been updated to "${statusText}".`,
        tone: isResolved ? "success" : "warning",
        createdAt: new Date().toISOString(),
        userId: ticket.createdBy || "",
        read: false,
      };

      if (ticket.createdBy) {
        await saveNotification(ticket.createdBy, statusNotif);
      }

      toast.success(`Ticket status updated to ${statusText}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!user) return;

    if (user.role === "technician" && ticket && ticket.assignedToId !== user.uid) {
      try {
        const ticketRef = doc(db, "tickets", id);
        await updateDoc(ticketRef, {
          assignedToId: user.uid,
          assignedToName: user.displayName || user.email || "Technician",
          status: "in_progress",
          updatedAt: serializeTimestamp(new Date()),
        });

        setTicket((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            assignedToId: user.uid,
            assignedToName: user.displayName || user.email || "Technician",
            status: "in_progress",
          };
        });

        toast.info("Ticket claimed by you as the assigned specialist.");
      } catch (assignErr) {
        console.warn("Failed to auto-assign ticket before message send:", assignErr);
      }
    }

    const payload = {
      content,
      ticketId: id,
      senderId: user.uid,
      senderName: user.displayName || user.email || "Technician",
      type: "public",
      createdAt: serializeTimestamp(new Date()),
    };

    try {
      await addDoc(collection(db, "tickets", id, "messages"), payload);

      const currentAssignedToId =
        user.role === "technician" && ticket?.assignedToId !== user.uid
          ? user.uid
          : ticket?.assignedToId;

      const recipientId = user.uid === ticket?.createdBy ? currentAssignedToId : ticket?.createdBy;

      if (recipientId) {
        const replyNotif: NotificationPayload = {
          title: `New reply on ${ticket?.subject || "ticket"}`,
          body: `${payload.senderName}: ${payload.content}`,
          tone: "primary",
          createdAt: new Date().toISOString(),
          userId: recipientId,
          read: false,
        };
        await saveNotification(recipientId, replyNotif);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  };

  const getExpectedUpdateTime = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "within 1h";
      case "high":
        return "within 3h";
      case "medium":
        return "within 8h";
      case "low":
      default:
        return "within 24h";
    }
  };

  const getProgressSteps = () => {
    if (!ticket) return [];

    const steps: { id: number; label: string; status: "completed" | "active" | "pending" }[] = [
      { id: 1, label: "Received", status: "completed" },
      { id: 2, label: "Assigned", status: "pending" },
      { id: 3, label: "Resolution In Progress", status: "pending" },
      { id: 4, label: "Resolved", status: "pending" },
    ];

    const isAssigned = !!ticket.assignedToId;
    const currentStatus = ticket.status.toLowerCase();

    if (
      isAssigned ||
      currentStatus === "in_progress" ||
      currentStatus === "resolved" ||
      currentStatus === "closed"
    ) {
      steps[1].status = "completed";
    } else if (currentStatus === "open") {
      steps[1].status = "active";
    }

    if (currentStatus === "resolved" || currentStatus === "closed") {
      steps[2].status = "completed";
    } else if (currentStatus === "in_progress") {
      steps[2].status = "active";
    } else if (currentStatus === "open" && isAssigned) {
      steps[2].status = "active";
    }

    if (currentStatus === "resolved" || currentStatus === "closed") {
      steps[3].status = "completed";
    }

    return steps;
  };

  const assignedTech = technicians.find((t) => t.uid === ticket?.assignedToId);
  const techName = assignedTech?.name || ticket?.assignedToName || "Support Specialist";
  const techRole = assignedTech?.role || "Support Specialist";
  const techOnline = assignedTech?.online ?? false;

  const getTechInitials = (name: string): string => {
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <MobileShell scrollable={false}>
      <div className="h-full flex flex-col justify-between w-full bg-background">
        <AppHeader
          title={ticket?.ticketSequenceId || "Loading..."}
          subtitle={ticket?.category || "Ticket Details"}
          back
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {ticket && (
            <>
              <div className="p-6 rounded-[2rem] bg-gradient-hero text-white shadow-lg relative overflow-hidden">
                <div className="flex gap-2">
                  {user?.role === "super_admin" || user?.role === "technician" ? (
                    <select
                      value={ticket.status}
                      onChange={handleStatusChange}
                      className="bg-white/10 hover:bg-white/15 text-white text-[11px] font-bold rounded-full px-3 py-1 border border-white/20 outline-none cursor-pointer focus:border-white/50 transition-colors capitalize appearance-none"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  ) : (
                    <span className="bg-white/10 text-white text-[11px] font-bold rounded-full px-3 py-1 border border-white/20 capitalize">
                      {ticket.status.replace("_", " ")}
                    </span>
                  )}
                  <span className="bg-white/10 text-white text-[11px] font-bold rounded-full px-3 py-1 border border-white/20 capitalize">
                    {ticket.priority}
                  </span>
                </div>

                <h1 className="mt-4 text-[20px] font-bold leading-tight tracking-tight">
                  {ticket.subject}
                </h1>

                {ticket.description && (
                  <p className="mt-2 text-[13px] text-white/80 font-medium leading-relaxed">
                    {ticket.description}
                  </p>
                )}

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-white/60 text-[12px]">
                  <span className="font-medium">Next update expected</span>
                  <div className="flex items-center gap-1 text-white font-semibold">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{getExpectedUpdateTime(ticket.priority)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  Progress
                </h2>
                <div className="bg-card border border-border p-5 rounded-3xl space-y-4 shadow-sm">
                  {getProgressSteps().map((step) => {
                    const isCompleted = step.status === "completed";
                    const isActive = step.status === "active";
                    return (
                      <div key={step.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <div className="h-6 w-6 rounded-full bg-[#0bb76e] text-white flex items-center justify-center shrink-0">
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </div>
                          ) : isActive ? (
                            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-bold shrink-0">
                              {step.id}
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-secondary text-muted-foreground/50 border border-border/80 flex items-center justify-center text-[11px] font-bold shrink-0">
                              {step.id}
                            </div>
                          )}
                          <span
                            className={`text-[13px] ${
                              isActive
                                ? "font-bold text-foreground"
                                : isCompleted
                                  ? "font-medium text-foreground/80"
                                  : "font-medium text-muted-foreground/60"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-extrabold text-primary tracking-wider uppercase">
                            Now
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  Your Specialist
                </h2>
                <div className="bg-card border border-border p-4 rounded-3xl shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[15px] shadow-sm">
                        {getTechInitials(techName)}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${
                          techOnline ? "bg-[#0bb76e]" : "bg-muted-foreground/30"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-foreground leading-snug">
                        {techName}
                      </h3>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {techRole === "technician" ? "Support Specialist" : techRole}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            techOnline ? "bg-[#0bb76e]" : "bg-muted-foreground/30"
                          }`}
                        />
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {techOnline ? "Online now" : "Offline"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {user?.role === "technician" && ticket && ticket.assignedToId !== user.uid ? (
                      <button
                        onClick={async () => {
                          try {
                            const ticketRef = doc(db, "tickets", id);
                            await updateDoc(ticketRef, {
                              assignedToId: user.uid,
                              assignedToName: user.displayName || user.email || "Technician",
                              status: "in_progress",
                              updatedAt: serializeTimestamp(new Date()),
                            });
                            setTicket((prev) => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                assignedToId: user.uid,
                                assignedToName: user.displayName || user.email || "Technician",
                                status: "in_progress",
                              };
                            });
                            toast.success("You have successfully claimed this ticket!");
                          } catch (err) {
                            console.error("Failed to claim ticket:", err);
                            toast.error("Failed to claim ticket.");
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[12px] font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                      >
                        Claim Ticket
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/95 transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <MessageCircle className="h-4.5 w-4.5" />
                        </button>
                        <a
                          href={`tel:+15550199`}
                          className="h-10 w-10 rounded-full bg-secondary text-foreground flex items-center justify-center hover:bg-secondary/80 transition-all border border-border/60 active:scale-95"
                        >
                          <Phone className="h-4.5 w-4.5" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 mb-4 border-b border-border/60 pb-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                  Messages
                </span>
              </div>
            </>
          )}

          {messages.map((msg, index) => {
            const isMe = msg.senderId === user?.uid;

            const msgDateStr = formatMessageDate(msg.createdAt);
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const prevMsgDateStr = prevMsg ? formatMessageDate(prevMsg.createdAt) : "";
            const showDivider = msgDateStr && msgDateStr !== prevMsgDateStr;

            return (
              <div key={msg.id} className="flex flex-col gap-3">
                {showDivider && (
                  <div className="flex items-center justify-center my-4 w-full">
                    <span className="bg-[#f0f0f0] dark:bg-secondary text-muted-foreground text-[10px] font-bold px-3 py-1 rounded-full border border-border/50 uppercase tracking-wider shadow-sm">
                      {msgDateStr}
                    </span>
                  </div>
                )}

                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[85%] p-3 shadow-sm ${
                      isMe
                        ? "bg-gradient-brand text-primary-foreground rounded-2xl rounded-tr-sm"
                        : "bg-card text-foreground rounded-2xl rounded-tl-sm border border-border/80"
                    }`}
                  >
                    {!isMe && msg.senderName && (
                      <p className="text-[10.5px] font-bold opacity-70 mb-1 uppercase tracking-wider">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="text-[14px] leading-relaxed">{msg.content}</p>

                    <div
                      className={`flex items-center gap-1 mt-1 text-[10px] ${
                        isMe ? "justify-end opacity-75" : "justify-start text-muted-foreground/60"
                      }`}
                    >
                      <span>{formatTimeOnly(msg.createdAt)}</span>
                      {isMe && <span>✓✓</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-2" />
        </div>

        <MessageInputForm onSendMessage={handleSendMessage} />
      </div>
    </MobileShell>
  );
}
