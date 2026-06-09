import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { AppHeader } from "@/components/AppHeader";
import { tickets, statusStyles, priorityStyles, type TicketStatus } from "@/lib/mock";
import { Search, SlidersHorizontal, Plus, Clock } from "lucide-react";

export const Route = createFileRoute("/tickets/")({ component: Tickets });

const tabs: { key: "all" | TicketStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
  { key: "escalated", label: "Escalated" },
];

function Tickets() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("all");
  const [q, setQ] = useState("");
  const list = tickets.filter(t =>
    (tab === "all" || t.status === tab) &&
    (q === "" || (t.title + t.id + t.category).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-32">
        <AppHeader title="Tickets" subtitle={`${list.length} matching`} right={
          <button className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        } />

        <div className="px-5">
          <label className="flex items-center gap-2 h-12 px-4 rounded-2xl bg-secondary">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by ID, title, category…"
              className="flex-1 bg-transparent outline-none text-[14px]"
            />
          </label>
        </div>

        {/* Tabs */}
        <div className="mt-4 px-5 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 px-4 h-9 rounded-full text-[12px] font-semibold transition-all ${tab === t.key ? "bg-primary text-primary-foreground shadow-elevated" : "bg-secondary text-muted-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-5 mt-4 space-y-3">
          {list.map((t) => {
            const ps = priorityStyles[t.priority];
            const ss = statusStyles[t.status];
            return (
              <Link key={t.id} to="/tickets/$id" params={{ id: t.id }} className="block rounded-2xl bg-card border border-border p-4 shadow-soft active:scale-[0.99] transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={t.category} />
                    <span className="text-[10px] font-bold text-muted-foreground tracking-wider">{t.id}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ss.bg} ${ss.text}`}>{ss.label}</span>
                </div>
                <p className="mt-2 text-[14.5px] font-semibold leading-snug">{t.title}</p>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ps.bg} ${ps.text} flex items-center gap-1`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${ps.dot}`} />
                      {ps.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-6 rounded-full bg-gradient-brand text-white text-[10px] font-bold flex items-center justify-center">{t.assignee.initials}</div>
                      <span className="text-[11px] text-muted-foreground">{t.assignee.name}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Updated {t.updated}</span>
                  <span className="flex items-center gap-1 font-semibold text-foreground/70">
                    <Clock className="h-3 w-3" /> SLA {t.slaHours}h
                  </span>
                </div>
              </Link>
            );
          })}
          {list.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">No tickets match your search.</div>
          )}
        </div>
      </div>

      <Link
        to="/tickets/new"
        className="fixed z-50 bottom-24 right-5 h-14 w-14 rounded-full bg-gradient-brand text-primary-foreground shadow-elevated hover:shadow-glow flex items-center justify-center"
        style={{ left: "calc(50% + 220px - 76px)" }}
      >
        <Plus className="h-6 w-6" />
      </Link>

      <BottomNav />
    </MobileShell>
  );
}

function CategoryIcon({ category }: { category: string }) {
  const map: Record<string, string> = { Network: "🌐", Email: "✉️", Hardware: "🖥️", Access: "🔑", Software: "💿", Infrastructure: "⚙️", Compliance: "🛡️" };
  return <span className="h-7 w-7 rounded-xl bg-secondary flex items-center justify-center text-[14px]">{map[category] ?? "✨"}</span>;
}
