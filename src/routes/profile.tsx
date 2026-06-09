import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { AppHeader } from "@/components/AppHeader";
import { Building2, Bell, Lock, Smartphone, Palette, History, HelpCircle, LogOut, ChevronRight, Pencil, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/profile")({ component: Profile });

const sections = [
  {
    title: "Account",
    items: [
      { icon: Building2, label: "Company information", hint: "Acme Corp · 1,240 seats" },
      { icon: ShieldCheck, label: "Security & 2FA", hint: "Face ID enabled" },
      { icon: Smartphone, label: "Linked devices", hint: "3 devices" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Bell, label: "Notifications", hint: "All alerts on" },
      { icon: Palette, label: "Theme", hint: "System" },
      { icon: History, label: "Activity log", hint: "Last 90 days" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help & support", hint: "Browse the help center" },
      { icon: Lock, label: "Privacy & terms", hint: "Read policies" },
    ],
  },
];

function Profile() {
  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-32">
        <AppHeader title="Profile" right={
          <button className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center"><Pencil className="h-4 w-4" /></button>
        } />

        {/* Profile card */}
        <div className="mx-5 rounded-3xl bg-gradient-hero text-white p-5 shadow-elevated relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary-glow/40 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-[22px] font-extrabold">AP</div>
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-bold">Alex Petrov</p>
              <p className="text-[12px] text-white/70">alex@acme.co</p>
              <p className="text-[10px] text-white/60 mt-0.5">Acme Corp · Engineering Ops</p>
            </div>
          </div>
          <div className="relative grid grid-cols-3 gap-3 mt-5">
            {[{ k: "Tickets", v: "128" }, { k: "Resolved", v: "112" }, { k: "Avg. rating", v: "4.9" }].map((s) => (
              <div key={s.k} className="rounded-2xl bg-white/10 backdrop-blur p-3 text-center">
                <p className="text-[16px] font-extrabold">{s.v}</p>
                <p className="text-[10px] text-white/60">{s.k}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 mt-6 space-y-6">
          {sections.map((sec) => (
            <div key={sec.title}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">{sec.title}</p>
              <div className="mt-3 rounded-2xl bg-card border border-border overflow-hidden">
                {sec.items.map((it, i) => {
                  const Icon = it.icon;
                  return (
                    <button key={it.label} className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors ${i !== sec.items.length - 1 ? "border-b border-border" : ""}`}>
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-[13.5px] font-semibold">{it.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{it.hint}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 mt-6">
          <Link to="/login" className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-destructive/10 text-destructive font-semibold">
            <LogOut className="h-4 w-4" /> Log out
          </Link>
          <p className="text-center text-[11px] text-muted-foreground/70 mt-4">AdviseTech v3.4.1 · SOC 2 Type II</p>
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
