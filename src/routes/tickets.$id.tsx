import { createFileRoute } from "@tanstack/react-router";
<<<<<<< HEAD
import { useEffect, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { doc, collection, onSnapshot, addDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { updateTicket } from "@/store/ticketSlice";
import { sanitizeQuerySnapshot, formatUSDateTime, serializeTimestamp, formatSLAWithCountdown, getPriorityBadgeClass, getStatusBadgeClass } from "@/lib/formatters";
import { useHeaderSetup } from "@/components/HeaderContext";
import { Send, Lock, Clock, Paperclip, ChevronLeft } from "lucide-react";
import { Ticket, Message } from "@/types/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
=======
import { MobileShell } from "@/components/MobileShell";
import { useHeaderSetup } from "@/components/HeaderContext";
import { useTicketWorkspace } from "@/hooks/useTicketWorkspace";
import { MessageTimeline } from "@/components/MessageTimeline";
import { MessageInputForm } from "@/components/MessageInputForm";
>>>>>>> 6ecfc7b6d14c5f2afb8a4501776dc60b8b7d8c77

export const Route = createFileRoute("/tickets/$id")({
  component: TicketWorkspace,
});

function TicketWorkspace() {
  const { id } = Route.useParams();
<<<<<<< HEAD
  const navigate = Route.useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [internalText, setInternalText] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const [slaText, setSlaText] = useState("");
  const [slaRisk, setSlaRisk] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to bottom when messages array changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // SLA Countdown
  useEffect(() => {
    if (!ticket?.slaDeadline) return;
    const updateSLA = () => {
      const { text, isBreached } = formatSLAWithCountdown(ticket.slaDeadline!);
      setSlaText(text);
      setSlaRisk(isBreached);
    };
    updateSLA();
    const interval = setInterval(updateSLA, 60000);
    return () => clearInterval(interval);
  }, [ticket?.slaDeadline]);

  // Dual Real-Time Subscriptions
  useEffect(() => {
    const unsubscribeTicket = onSnapshot(doc(db, "tickets", id), (snapshot) => {
      if (snapshot.exists()) {
        const ticketData = { id: snapshot.id, ...snapshot.data() } as Ticket;
        setTicket(ticketData);
        if (updateTicket) {
          dispatch(updateTicket(ticketData));
        }
      }
    });

    const messagesQuery = query(
      collection(db, "tickets", id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = sanitizeQuerySnapshot<Message>(snapshot);
      setMessages(msgs);
    });

    return () => {
      unsubscribeTicket();
      unsubscribeMessages();
    };
  }, [id, dispatch]);

  const handleSendMessage = async (type: "public" | "internal") => {
    if (!user || isSending) return;
    const content = type === "public" ? replyText.trim() : internalText.trim();
    if (!content) return;

    setIsSending(true);
    const payload = {
      content,
      ticketId: id,
      senderId: user.uid,
      senderName: user.displayName || user.email || "Technician",
      type,
      createdAt: serializeTimestamp(new Date()),
    };

    try {
      await addDoc(collection(db, "tickets", id, "messages"), payload);
      if (type === "public") setReplyText("");
      else setInternalText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };
=======
  const { ticket, messages, user, sendMessage } = useTicketWorkspace(id);
>>>>>>> 6ecfc7b6d14c5f2afb8a4501776dc60b8b7d8c77

  useHeaderSetup(
    {
      title: "Workspace",
      subtitle: ticket?.id || id || "",
      back: true,
    },
    [ticket?.id]
  );

  const isTechnician = user?.role === 'technician';
  const priorityBadge = ticket ? getPriorityBadgeClass(ticket.priority) : null;

  return (
<<<<<<< HEAD
    <div className="h-full w-full max-w-7xl mx-auto bg-background p-4 xl:p-6 flex flex-col overflow-hidden">
      
      {ticket && (
        <div className="flex shrink-0 items-center gap-4 mb-6">
            <button 
              onClick={() => navigate({ to: '/dashboard' as any })} // Type hack to avoid tight coupling
              className="hidden xl:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Master Queue
            </button>
            <div className="hidden xl:block h-4 w-px bg-border" />
            <span className="font-mono tracking-tight font-semibold text-lg">{ticket.id}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${priorityBadge?.bg} ${priorityBadge?.text}`}>
              {ticket.priority}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusBadgeClass(ticket.status)}`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
        )}

        <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-10 gap-6">
          {/* Left Stream Workspace (70% Width) */}
          <div className="xl:col-span-7 flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-background/20">
              {ticket?.description && (
                <div className="flex flex-col items-start mb-6">
                  <div className="bg-muted/60 text-foreground max-w-[85%] rounded-2xl rounded-tl-none p-4 border border-border/40">
                    <p className="text-[14px] leading-relaxed">{ticket.description}</p>
                  </div>
                  <div className="flex items-center justify-center w-full my-4">
                    <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase text-center">
                      — TICKET CREATED —
                    </span>
                  </div>
                </div>
              )}

              {messages.map((msg) => {
                const isInternal = msg.type === "internal";
                const isMe = msg.senderId === user?.uid;

                if (isInternal) {
                  return (
                    <div key={msg.id} className="w-full flex justify-center my-6">
                      <div className="bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/20 rounded-xl p-4 font-medium text-xs w-full sm:w-[85%] flex flex-col gap-2 shadow-sm">
                        <div className="flex items-center gap-2 opacity-80 mb-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span className="uppercase tracking-widest font-bold text-[10px]">Staff-Only Internal Note • {msg.senderName}</span>
                        </div>
                        <p className="text-[13px] leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex flex-col mb-4 ${isMe ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">{isMe ? "You" : msg.senderName}</span>
                      <span className="text-[10px] text-muted-foreground opacity-70">{formatUSDateTime(msg.createdAt)}</span>
                    </div>
                    <div
                      className={`${
                        isMe
                          ? "bg-primary text-primary-foreground max-w-[85%] rounded-2xl rounded-tr-none p-4 shadow-sm"
                          : "bg-muted/60 text-foreground max-w-[85%] rounded-2xl rounded-tl-none p-4 border border-border/40"
                      }`}
                    >
                      <p className="text-[14px] leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            <div className="p-4 border-t border-border bg-card shrink-0">
              <Tabs defaultValue="public" className="w-full">
                <TabsList className="mb-3">
                  <TabsTrigger value="public">Public Message</TabsTrigger>
                  <TabsTrigger value="internal" className="text-amber-600 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-700">Internal Staff Note</TabsTrigger>
                </TabsList>
                
                <TabsContent value="public" className="m-0 focus-visible:outline-none">
                  <div className="relative">
                    <Textarea 
                      placeholder="Reply to the user..."
                      className="min-h-[100px] resize-none pr-14 border-input focus-visible:ring-2 focus-visible:ring-ring"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-2">
                      <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button 
                        disabled={!replyText.trim() || isSending}
                        onClick={() => handleSendMessage("public")}
                        className="p-2 bg-primary text-primary-foreground rounded-full shadow-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="internal" className="m-0 focus-visible:outline-none">
                  <div className="relative rounded-lg border border-amber-500/30 bg-amber-500/5 focus-within:border-amber-500/50 transition-colors">
                    <Textarea 
                      placeholder="Write an internal note (hidden from user)..."
                      className="min-h-[100px] resize-none pr-14 border-none bg-transparent focus-visible:ring-0 placeholder:text-amber-900/40 text-amber-900 dark:text-amber-100"
                      value={internalText}
                      onChange={(e) => setInternalText(e.target.value)}
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-2">
                      <button className="p-2 text-amber-900/50 hover:text-amber-900 transition-colors rounded-full hover:bg-amber-500/10">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button 
                        disabled={!internalText.trim() || isSending}
                        onClick={() => handleSendMessage("internal")}
                        className="p-2 bg-amber-600 text-white rounded-full shadow-sm disabled:opacity-50 hover:bg-amber-700 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Parameters Sidebar (30% Width) */}
          <div className="xl:col-span-3 flex flex-col gap-5 bg-card p-5 rounded-xl border border-border shadow-xs overflow-y-auto h-full">
            {ticket?.slaDeadline && (
              <div className={`p-4 rounded-xl border flex flex-col gap-1 ${slaRisk ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-muted/40 border-border text-foreground'}`}>
                <div className="flex items-center gap-2 opacity-80 text-[11px] font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  SLA Deadline Contract
                </div>
                <div className="text-xl font-bold tracking-tight">
                  {slaText}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  Assigned Personnel
                </label>
                <select 
                  className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={isTechnician}
                  value={ticket?.assignedToId || ""}
                  onChange={() => {}}
                >
                  <option value="" disabled>Select agent...</option>
                  <option value={ticket?.assignedToId || ""}>{ticket?.assignedToName || "Alex Rivera (Tech)"}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Classification Metrics
                </label>
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-muted-foreground mb-1 block">Category</span>
                    <select 
                      className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      disabled={isTechnician}
                      value={ticket?.category || "software"}
                      onChange={() => {}}
                    >
                      <option value="software">Core MERN Stack</option>
                      <option value="hardware">Hardware</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground mb-1 block">Priority</span>
                    <select 
                      className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      disabled={isTechnician}
                      value={ticket?.priority || "medium"}
                      onChange={() => {}}
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Core Control Actions */}
              {!isTechnician && (
                <div className="pt-6 border-t border-border mt-4 space-y-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Core Control Actions</h3>
                  <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium h-10 rounded-md transition-colors">
                    Resolve Ticket
                  </button>
                  <button className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm font-medium h-10 rounded-md transition-colors">
                    Escalate Task
                  </button>
                </div>
              )}
            </div>
          </div>
=======
    <MobileShell scrollable={false}>
      {/* Mobile WebView Guardrail constraints */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden w-full max-w-md mx-auto md:max-w-4xl bg-background">
        <MessageTimeline ticket={ticket} messages={messages} currentUserUid={user?.uid} />
        <MessageInputForm onSendMessage={sendMessage} />
>>>>>>> 6ecfc7b6d14c5f2afb8a4501776dc60b8b7d8c77
      </div>
    </div>
  );
}
