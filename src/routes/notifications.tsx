import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { AppHeader } from "@/components/AppHeader";
import { AlertTriangle, CheckCircle2, MessageSquare, UserPlus, Wrench, Settings2 } from "lucide-react";

export const Route = createFileRoute("/notifications")({ component: Notifications });

const groups = [
  {
    title: "Today",
    items: [
      { icon: AlertTriangle, tone: "destructive", title: "SLA breach risk", body: "AT-2835 has 32 minutes remaining.", time: "2m" },
      { icon: MessageSquare, tone: "primary", title: "New reply on AT-2841", body: "Priya: Profile update pushed — try reconnecting.", time: "14m" },
      { icon: UserPlus, tone: "primary", title: "Technician assigned", body: "Marco Diaz picked up AT-2839.", time: "1h" },
    ],
  },
  {
    title: "Yesterday",
    items: [
      { icon: CheckCircle2, tone: "success", title: "Ticket resolved", body: "AT-2828 marked as resolved by Sam Kim.", time: "1d" },
      { icon: Wrench, tone: "warning", title: "System maintenance", body: "Scheduled VPN gateway restart Sat 02:00 UTC.", time: "1d" },
    ],
  },
];

const tones: Record<string, { bg: string; text: string }> = {
  destructive: { bg: "bg-destructive/12", text: "text-destructive" },
  primary:     { bg: "bg-primary/10",     text: "text-primary" },
  success:     { bg: "bg-success/15",     text: "text-success" },
  warning:     { bg: "bg-warning/15",     text: "text-warning" },
};

function Notifications() {
  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-32">
        <AppHeader title="Notifications" subtitle="5 new" right={
          <button className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center"><Settings2 className="h-4 w-4" /></button>
        } />

        <div className="px-5 space-y-6">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{g.title}</p>
              <div className="mt-3 space-y-2">
                {g.items.map((it, i) => {
                  const tone = tones[it.tone];
                  const Icon = it.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-card border border-border">
                      <div className={`h-10 w-10 rounded-xl ${tone.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-4 w-4 ${tone.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <p className="text-[13.5px] font-semibold">{it.title}</p>
                          <span className="text-[11px] text-muted-foreground shrink-0">{it.time}</span>
                        </div>
                        <p className="text-[12.5px] text-muted-foreground mt-0.5 leading-snug">{it.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-5 mt-6 rounded-3xl bg-card border border-border p-4">
          <p className="text-[13px] font-bold">Notification preferences</p>
          <div className="mt-3 space-y-2">
            {["SLA alerts", "New replies", "Status changes", "Weekly digest"].map((p, i) => (
              <label key={p} className="flex items-center justify-between py-2">
                <span className="text-[13px]">{p}</span>
                <Toggle on={i !== 3} />
              </label>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span className={`h-6 w-10 rounded-full p-0.5 transition-colors ${on ? "bg-primary" : "bg-muted"}`}>
      <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : ""}`} />
    </span>
  );
}
