import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { AppHeader } from "@/components/AppHeader";
import { tickets, statusStyles, priorityStyles } from "@/lib/mock";
import {
  Paperclip,
  Mic,
  Send,
  MoreVertical,
  AlertTriangle,
  RefreshCcw,
  Clock,
  CheckCheck,
  Image as ImageIcon,
} from "lucide-react";

export const Route = createFileRoute("/tickets/$id")({ component: TicketDetail });

const messages = [
  {
    from: "user",
    text: "Hey — VPN keeps dropping every ~10 minutes on my MacBook (M2, Sonoma 14.5). Reinstalled AnyConnect already.",
    time: "14:02",
  },
  {
    from: "tech",
    text: "Thanks for the details, Alex 👋  Looking at your client logs now. Can you grab a screenshot of the AnyConnect status window when it drops?",
    time: "14:04",
  },
  { from: "user", text: "Sure — uploading now.", time: "14:05" },
  { from: "user", attachment: "screenshot-14-05.png", time: "14:05" },
  {
    from: "tech",
    text: "Got it. Looks like the EAP-FAST handshake is timing out. I'm pushing a profile update — please reconnect once.",
    time: "14:09",
    read: true,
  },
];

function TicketDetail() {
  const { id } = Route.useParams();
  const t = tickets.find((x) => x.id === id) ?? tickets[0];
  const [tab, setTab] = useState<"chat" | "timeline" | "details">("chat");

  return (
    <MobileShell>
      <div className="min-h-screen bg-background flex flex-col pb-24">
        <AppHeader
          title={t.id}
          subtitle={t.category}
          back
          right={
            <button className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <MoreVertical className="h-4 w-4" />
            </button>
          }
        />

        {/* Summary card */}
        <div className="mx-5 rounded-3xl bg-gradient-hero text-white p-5 shadow-elevated relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary-glow/40 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 backdrop-blur`}
              >
                {statusStyles[t.status].label}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 backdrop-blur">
                {priorityStyles[t.priority].label}
              </span>
            </div>
            <p className="mt-3 text-[18px] font-bold leading-snug text-balance">{t.title}</p>
            <p className="mt-2 text-[12px] text-white/70">{t.description}</p>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-[12px] font-bold">
                  {t.assignee.initials}
                </div>
                <div>
                  <p className="text-[12px] font-semibold">{t.assignee.name}</p>
                  <p className="text-[10px] text-white/60 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" /> Online · typing
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/60 uppercase">SLA</p>
                <p className="text-[14px] font-bold flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {t.slaHours}h 12m
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-5 mt-5 p-1 rounded-2xl bg-secondary grid grid-cols-3">
          {(["chat", "timeline", "details"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`h-9 rounded-xl text-[12px] font-semibold capitalize transition-all ${tab === k ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="px-5 mt-4 flex-1">
          {tab === "chat" && (
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${m.from === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border border-border rounded-bl-md"}`}
                  >
                    {m.attachment ? (
                      <div className="rounded-xl bg-white/15 p-3 flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold">{m.attachment}</p>
                          <p className="text-[10px] opacity-70">1.2 MB · PNG</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[13.5px] leading-snug">{m.text}</p>
                    )}
                    <div
                      className={`mt-1 flex items-center gap-1 text-[10px] ${m.from === "user" ? "text-white/70" : "text-muted-foreground"}`}
                    >
                      {m.time}
                      {m.from === "user" && <CheckCheck className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-3 py-2.5 flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === "timeline" && (
            <div className="relative pl-6 space-y-5">
              <span className="absolute left-2 top-2 bottom-2 w-px bg-border" />
              {[
                { t: "Ticket raised", s: "by Alex Petrov · 14:01" },
                { t: "Auto-assigned to Priya Nair", s: "Routing rule: Network · Priority High" },
                { t: "Technician responded", s: "First reply within 3m" },
                { t: "Profile update pushed", s: "14:09 · ongoing" },
              ].map((e, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[18px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                  <p className="text-[13.5px] font-semibold">{e.t}</p>
                  <p className="text-[11.5px] text-muted-foreground">{e.s}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "details" && (
            <div className="space-y-3">
              <Detail k="Ticket ID" v={t.id} />
              <Detail k="Category" v={t.category} />
              <Detail k="Priority" v={priorityStyles[t.priority].label} />
              <Detail k="Status" v={statusStyles[t.status].label} />
              <Detail k="Created" v="Today · 14:01" />
              <Detail k="SLA target" v={`${t.slaHours} hours`} />
              <Detail k="Assignee" v={t.assignee.name} />
            </div>
          )}
        </div>

        <div className="px-5 mt-5 grid grid-cols-2 gap-3">
          <button className="h-12 rounded-2xl bg-destructive/10 text-destructive font-semibold text-[13px] flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Escalate
          </button>
          <button className="h-12 rounded-2xl bg-secondary font-semibold text-[13px] flex items-center justify-center gap-2">
            <RefreshCcw className="h-4 w-4" /> Reopen
          </button>
        </div>
      </div>

      {/* Composer */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-3 pb-3 pt-2 bg-gradient-to-t from-background via-background/90 to-transparent">
        <div className="glass rounded-2xl flex items-center gap-1 px-2 py-1.5 shadow-elevated">
          <button className="h-10 w-10 rounded-xl hover:bg-muted flex items-center justify-center">
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            placeholder="Type a message…"
            className="flex-1 bg-transparent outline-none px-2 text-[14px]"
          />
          <button className="h-10 w-10 rounded-xl hover:bg-muted flex items-center justify-center">
            <Mic className="h-4 w-4" />
          </button>
          <button className="h-10 w-10 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </MobileShell>
  );
}

function Detail({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 py-2.5 px-4 rounded-xl bg-card border border-border">
      <span className="text-[12px] text-muted-foreground">{k}</span>
      <span className="text-[13px] font-semibold">{v}</span>
    </div>
  );
}
