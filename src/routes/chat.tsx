import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { AppHeader } from "@/components/AppHeader";
import { Paperclip, Send, Mic } from "lucide-react";

export const Route = createFileRoute("/chat")({ component: Chat });

const conversations = [
  {
    id: 1,
    name: "Priya Nair",
    role: "Network Lead",
    last: "Pushed a profile update — try reconnecting.",
    time: "14:09",
    unread: 2,
    online: true,
    initials: "PN",
  },
  {
    id: 2,
    name: "Marco Diaz",
    role: "Email & Collab",
    last: "Calendar permissions look correct now.",
    time: "13:40",
    unread: 0,
    online: true,
    initials: "MD",
  },
  {
    id: 3,
    name: "Lena Okafor",
    role: "Infra SRE",
    last: "Investigating latency on shard-04.",
    time: "13:12",
    unread: 1,
    online: true,
    initials: "LO",
  },
  {
    id: 4,
    name: "Sam Kim",
    role: "Hardware",
    last: "Replacement printer arrives tomorrow.",
    time: "Yesterday",
    unread: 0,
    online: false,
    initials: "SK",
  },
  {
    id: 5,
    name: "Aria Bennett",
    role: "Access",
    last: "Okta + Duo provisioning complete.",
    time: "Yesterday",
    unread: 0,
    online: true,
    initials: "AB",
  },
];

function Chat() {
  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-32">
        <AppHeader title="Support chat" subtitle="5 active threads" />

        <div className="px-5 space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              to="/tickets/$id"
              params={{ id: "AT-2841" }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:shadow-soft transition-shadow"
            >
              <div className="relative h-12 w-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center font-bold">
                {c.initials}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card ${c.online ? "bg-success" : "bg-muted-foreground"}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-semibold truncate">{c.name}</p>
                  <span className="text-[10.5px] text-muted-foreground">{c.time}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12.5px] text-muted-foreground truncate">{c.last}</p>
                  {c.unread > 0 && (
                    <span className="shrink-0 h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mx-5 mt-6 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Push notification preview
          </p>
          <div className="mt-3 rounded-2xl bg-card border border-border p-3 flex items-start gap-3 shadow-soft">
            <div className="h-9 w-9 rounded-lg bg-gradient-brand" />
            <div className="flex-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground">AdviseTech</span>
                <span>now</span>
              </div>
              <p className="text-[12.5px] font-semibold mt-0.5">Priya replied to AT-2841</p>
              <p className="text-[11.5px] text-muted-foreground line-clamp-2">
                Profile update pushed — try reconnecting once.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
