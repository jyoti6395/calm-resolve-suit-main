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
import { MessageInputForm } from "@/features/tickets/components/MessageInputForm";
import type { Ticket, Message } from "@/types/store";
import { toast } from "sonner";
import { downloadFile } from "@/lib/utils";
import {
  Clock,
  Check,
  Phone,
  ArrowLeft,
  MoreHorizontal,
  MessageCircle,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface NotificationPayload {
  title: string;
  body: string;
  tone: "success" | "warning" | "primary" | "info";
  createdAt: string;
  userId: string;
  read: boolean;
  ticketId?: string;
  type?: string;
  recipientId?: string;
  message?: string;
}

async function saveNotification(recipientId: string, payload: NotificationPayload) {
  const fullPayload = {
    ...payload,
    recipientId: recipientId,
    message: payload.body,
    type: payload.type || "ticket",
  };
  try {
    await addDoc(collection(db, "notifications"), fullPayload);
  } catch (err) {
    console.warn("Failed to write notification to root, trying subcollection...", err);
    try {
      await addDoc(collection(db, "users", recipientId, "notifications"), fullPayload);
    } catch (subErr) {
      console.warn("Failed to save notification in both locations:", subErr);
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
    hour12: true,
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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DesktopTicketDetailView({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);
  const { technicians } = useAppSelector((state) => state.technicians);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);
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
      const isClosed = newStatus === "closed";
      const statusText = newStatus.replace("_", " ");
      const statusNotif: NotificationPayload = {
        title: isResolved
          ? "Ticket resolved"
          : isClosed
            ? "Ticket closed"
            : "Ticket status updated",
        body: `Your ticket "${ticket.subject}" status has been updated to "${statusText}".`,
        tone: isResolved || isClosed ? "success" : "warning",
        createdAt: new Date().toISOString(),
        userId: ticket.createdBy || "",
        read: false,
        ticketId: ticket.id,
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

  const handleSendMessage = async (content: string, imageUrl?: string) => {
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

        // Send notification to the customer
        const customerId = ticket.createdBy;
        if (customerId) {
          const claimNotif: NotificationPayload = {
            title: "Technician assigned",
            body: `${user.displayName || user.email || "Technician"} has claimed and been assigned to your ticket: "${ticket.subject || "unnamed"}".`,
            tone: "primary",
            createdAt: new Date().toISOString(),
            userId: customerId,
            read: false,
            ticketId: id,
          };
          await saveNotification(customerId, claimNotif);
        }
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
      ...(imageUrl && { imageUrl }),
    };

    try {
      await addDoc(collection(db, "tickets", id, "messages"), payload);

      const currentAssignedToId =
        user.role === "technician" && ticket?.assignedToId !== user.uid
          ? user.uid
          : ticket?.assignedToId;

      const recipientId = user.uid === ticket?.createdBy ? currentAssignedToId : ticket?.createdBy;

      if (recipientId) {
        const bodyText = payload.content
          ? `${payload.senderName}: ${payload.content}`
          : `${payload.senderName} sent an image attachment`;
        const replyNotif: NotificationPayload = {
          title: `New reply on ${ticket?.subject || "ticket"}`,
          body: bodyText,
          tone: "primary",
          createdAt: new Date().toISOString(),
          userId: recipientId,
          read: false,
          ticketId: id,
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

  const handleDownload = async (e: React.MouseEvent, url: string, filename: string) => {
    e.preventDefault();
    e.stopPropagation();
    toast.promise(downloadFile(url, filename), {
      loading: `Downloading ${filename}...`,
      success: `${filename} downloaded successfully!`,
      error: `Could not download ${filename} directly, opening...`,
    });
  };

  const isPreviewImage =
    !!previewFile?.name.match(/\.(jpeg|jpg|gif|png|webp)$/i) ||
    !!previewFile?.url.includes("photo") ||
    (!!previewFile && !previewFile.name.includes("."));
  const isPreviewPdf = !!previewFile?.name.toLowerCase().endsWith(".pdf");

  if (!ticket) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0 bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium text-sm">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-slate-50 overflow-hidden">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/tickets"
            search={{ status: "all" }}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[18px] font-bold text-slate-800 tracking-tight">
                {ticket.ticketSequenceId || ticket.id.slice(0, 10)}
              </h1>
            </div>
            <p className="text-[13px] text-slate-500 mt-0.5 font-medium">
              {ticket.category || "General Request"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-y-auto lg:overflow-hidden p-6 lg:p-8 gap-6 max-w-[1600px] w-full mx-auto">
        {/* Left Pane: Ticket Details */}
        <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-col gap-5 pb-2 lg:pb-8 md:items-start lg:items-stretch lg:overflow-y-auto lg:max-h-full">
          <div className="md:col-span-1 lg:col-span-1 p-6 xl:p-8 rounded-[2rem] bg-gradient-hero text-white shadow-lg relative overflow-hidden h-fit lg:h-auto w-full shrink-0">
            <div className="flex gap-2 mb-4">
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
                {ticket.priority} Priority
              </span>
            </div>

            <h2 className="text-[20px] font-bold leading-tight tracking-tight">{ticket.subject}</h2>

            {ticket.description && (
              <p className="mt-3 text-[14px] text-white/80 leading-relaxed font-medium">
                {ticket.description}
              </p>
            )}

            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5 ">
                <p className="text-[11px] font-bold  tracking-widest text-white/60">
                  Attachments ({ticket.attachments.length})
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {ticket.attachments.map((file, idx) => {
                    const isImage =
                      file.type === "photo" || file.name.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                    const FileIcon = isImage ? ImageIcon : FileText;
                    return (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPreviewFile({ url: file.url, name: file.name });
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.99] transition-all border border-white/10 group cursor-pointer w-full text-left"
                      >
                        <div className="h-8.5 w-8.5 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                          <FileIcon className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-[13px] font-bold text-white truncate flex-1 pr-2 group-hover:underline">
                          {file.name}
                        </span>
                        <span className="text-[11.5px] text-white/50 font-semibold mr-1 select-none">
                          Preview
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-white/60 text-[12px]">
              <span className="font-medium">Next update expected</span>
              <div className="flex items-center gap-1 text-white font-semibold">
                <Clock className="h-3.5 w-3.5" />
                <span>{getExpectedUpdateTime(ticket.priority)}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-1 lg:col-span-1 flex flex-col gap-5 w-full h-fit lg:h-auto shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[12px] font-bold text-slate-500  tracking-wider">Progress</h3>
              </div>
              <div className="flex flex-col">
                {getProgressSteps().map((step, index, arr) => {
                  const isCompleted = step.status === "completed";
                  const isActive = step.status === "active";
                  const isLast = index === arr.length - 1;
                  return (
                    <div key={step.id} className="relative flex gap-4 pb-7 last:pb-0">
                      {!isLast && (
                        <div
                          className={`absolute left-[11px] top-6 bottom-0 w-[2px] ${step.status === "completed" ? "bg-green-500" : "bg-slate-100"}`}
                        />
                      )}
                      <div className="relative z-10 shrink-0">
                        {isCompleted ? (
                          <div className="h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center ring-4 ring-white">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </div>
                        ) : isActive ? (
                          <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold ring-4 ring-blue-50">
                            {step.id}
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center text-[11px] font-bold ring-4 ring-white">
                            {step.id}
                          </div>
                        )}
                      </div>
                      <div className="pt-0.5 flex flex-col">
                        <span
                          className={`text-[13.5px] ${isActive ? "font-bold text-slate-800" : isCompleted ? "font-semibold text-slate-600" : "font-medium text-slate-400"}`}
                        >
                          {step.label}
                        </span>
                        {isActive && (
                          <span className="text-[11px] font-bold text-blue-600 mt-0.5">
                            Current Status
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-fit w-full">
              <h3 className="text-[12px] font-bold text-slate-500  tracking-wider mb-4">
                Assigned Specialist
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-11 w-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[14px]">
                      {getTechInitials(techName)}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${techOnline ? "bg-green-500" : "bg-slate-300"}`}
                    />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-800">{techName}</h4>
                    <p className="text-[12px] text-slate-500 font-medium">
                      {techRole === "technician" ? "Support Specialist" : techRole}
                    </p>
                  </div>
                </div>
                <a
                  href={`tel:+15550199`}
                  className="h-9 w-9 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Chat Window */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[650px] lg:h-full">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex justify-between items-center shrink-0">
            <div>
              <h3 className="text-[15px] font-bold text-slate-800">Conversation History</h3>
              <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                {messages.length} messages
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-slate-400" />
                </div>
                <h4 className="text-[16px] font-bold text-slate-800 mb-1">No messages yet</h4>
                <p className="text-[13px] text-slate-500 max-w-[250px]">
                  Send a message to the support team to start the conversation.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, index) => {
                  const isMe = msg.senderId === user?.uid;
                  const msgDateStr = formatMessageDate(msg.createdAt);
                  const prevMsg = index > 0 ? messages[index - 1] : null;
                  const prevMsgDateStr = prevMsg ? formatMessageDate(prevMsg.createdAt) : "";
                  const showDivider = msgDateStr && msgDateStr !== prevMsgDateStr;

                  return (
                    <div key={msg.id} className="flex flex-col gap-4">
                      {showDivider && (
                        <div className="flex items-center justify-center my-4 w-full">
                          <span className="bg-slate-200/50 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full  tracking-wider">
                            {msgDateStr}
                          </span>
                        </div>
                      )}

                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div
                          className={`flex items-start gap-2.5 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"}`}
                        >
                          {/* Avatar placeholder if not me */}
                          {!isMe && (
                            <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-white shadow-sm">
                              {getTechInitials(msg.senderName || "U")}
                            </div>
                          )}

                          <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            {!isMe && msg.senderName && (
                              <span className="text-[11px] font-bold text-slate-500 mb-1 ml-1">
                                {msg.senderName}
                              </span>
                            )}
                            <div
                              className={`px-4 py-2.5 shadow-sm ${
                                isMe
                                  ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                                  : "bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-200"
                              }`}
                            >
                              {msg.imageUrl && (
                                <div className="mb-2 rounded-xl overflow-hidden max-w-full">
                                  <img
                                    src={msg.imageUrl}
                                    alt="Attachment"
                                    className="w-full h-auto max-h-[300px] object-cover cursor-pointer hover:opacity-95 transition-opacity rounded-xl"
                                    onClick={() =>
                                      setPreviewFile({
                                        url: msg.imageUrl || "",
                                        name: "Attachment",
                                      })
                                    }
                                  />
                                </div>
                              )}
                              {msg.content && (
                                <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap break-words">
                                  {msg.content}
                                </p>
                              )}
                            </div>
                            <div
                              className={`flex items-center gap-1 mt-1 text-[10px] font-medium ${isMe ? "text-slate-400 mr-1" : "text-slate-400 ml-1"}`}
                            >
                              <span>{formatTimeOnly(msg.createdAt)}</span>
                              {isMe && <Check className="h-3 w-3 text-blue-500" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} className="h-2" />
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-0 bg-white border-t border-slate-100 shrink-0">
            <MessageInputForm
              ticketId={id}
              userId={user?.uid || ""}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>

      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent
          className={`${isPreviewPdf ? "max-w-5xl h-[90vh]" : "max-w-4xl"} p-0 border-none bg-transparent shadow-none flex items-center justify-center text-white`}
        >
          <DialogTitle className="sr-only">File Preview</DialogTitle>
          <DialogDescription className="sr-only">Full size attachment preview</DialogDescription>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {isPreviewImage ? (
              <img
                src={previewFile?.url || ""}
                alt={previewFile?.name || "Attachment"}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
              />
            ) : isPreviewPdf ? (
              <iframe
                src={previewFile?.url || ""}
                title={previewFile?.name || "PDF Document"}
                className="w-full h-[80vh] rounded-lg border-none bg-white shadow-2xl"
              />
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center max-w-sm text-center shadow-2xl">
                <FileText className="h-16 w-16 text-slate-400 mb-4" />
                <h4 className="text-[16px] font-bold text-white mb-2">{previewFile?.name}</h4>
                <p className="text-[13px] text-slate-400 mb-6">
                  Preview is not supported for this file type in-app.
                </p>
                <a
                  href={previewFile?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-[13.5px] font-bold text-white shadow-md cursor-pointer"
                >
                  Open in New Tab
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
