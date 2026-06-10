import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { AppHeader } from "@/components/AppHeader";
import { TrendingUp, TrendingDown, Download } from "lucide-react";

export const Route = createFileRoute("/analytics")({ component: Analytics });

const trend = [22, 28, 19, 34, 30, 42, 38, 46, 41, 52, 48, 58];
const max = Math.max(...trend);
const categoriesData = [
  { k: "Network", v: 38, color: "oklch(0.55 0.22 263)" },
  { k: "Email", v: 22, color: "oklch(0.62 0.18 200)" },
  { k: "Hardware", v: 16, color: "oklch(0.7 0.16 160)" },
  { k: "Access", v: 14, color: "oklch(0.65 0.2 300)" },
  { k: "Other", v: 10, color: "oklch(0.75 0.05 260)" },
];

function Analytics() {
  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-32">
        <AppHeader
          title="Insights"
          subtitle="Last 30 days"
          right={
            <button className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <Download className="h-4 w-4" />
            </button>
          }
        />

        <div className="px-5 grid grid-cols-2 gap-3">
          <Stat label="Avg. resolution" value="3h 12m" delta="-18%" good />
          <Stat label="SLA compliance" value="96.4%" delta="+2.1%" good />
          <Stat label="Tickets raised" value="412" delta="+12%" />
          <Stat label="First reply" value="4m 28s" delta="-9%" good />
        </div>

        {/* Trend chart */}
        <div className="mx-5 mt-5 rounded-3xl bg-card border border-border p-5 shadow-soft">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[12px] text-muted-foreground">Ticket volume</p>
              <p className="text-[22px] font-extrabold tracking-tight">412</p>
            </div>
            <span className="text-[11px] font-semibold text-success bg-success/15 px-2 py-1 rounded-full">
              +12% MoM
            </span>
          </div>
          <svg viewBox="0 0 320 120" className="mt-4 w-full h-32">
            <defs>
              <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.55 0.22 263)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="oklch(0.55 0.22 263)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const pts = trend.map((v, i) => [
                i * (320 / (trend.length - 1)),
                110 - (v / max) * 95,
              ]);
              const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
              const area = `${line} L 320 120 L 0 120 Z`;
              return (
                <>
                  <path d={area} fill="url(#area)" />
                  <path
                    d={line}
                    stroke="oklch(0.45 0.2 263)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {pts.map(
                    (p, i) =>
                      i === pts.length - 1 && (
                        <circle
                          key={i}
                          cx={p[0]}
                          cy={p[1]}
                          r="4.5"
                          fill="oklch(0.55 0.22 263)"
                          stroke="white"
                          strokeWidth="2"
                        />
                      ),
                  )}
                </>
              );
            })()}
          </svg>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Jan</span>
            <span>Mar</span>
            <span>May</span>
            <span>Jul</span>
            <span>Sep</span>
            <span>Nov</span>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="mx-5 mt-5 rounded-3xl bg-card border border-border p-5 shadow-soft">
          <p className="text-[14px] font-bold">Category breakdown</p>
          <div className="mt-4 space-y-3">
            {categoriesData.map((c) => (
              <div key={c.k}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="font-semibold">{c.k}</span>
                  <span className="text-muted-foreground">{c.v}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${c.v}%`, backgroundColor: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technician performance */}
        <div className="mx-5 mt-5 rounded-3xl bg-card border border-border p-5 shadow-soft">
          <div className="flex justify-between items-center">
            <p className="text-[14px] font-bold">Technician performance</p>
            <span className="text-[11px] text-muted-foreground">This month</span>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { n: "Priya Nair", t: 96, r: 4.9, s: "98% SLA" },
              { n: "Lena Okafor", t: 84, r: 4.8, s: "94% SLA" },
              { n: "Marco Diaz", t: 71, r: 4.7, s: "97% SLA" },
            ].map((x, i) => (
              <div key={x.n} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-brand text-white flex items-center justify-center text-[12px] font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate">{x.n}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {x.t} resolved · ★ {x.r}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-success bg-success/15 px-2 py-1 rounded-full">
                  {x.s}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-5 mt-5 rounded-3xl bg-gradient-hero text-white p-5 shadow-elevated relative overflow-hidden">
          <div className="absolute -top-10 -right-8 h-32 w-32 rounded-full bg-primary-glow/40 blur-3xl" />
          <p className="relative text-[11px] uppercase tracking-wider text-white/70 font-bold">
            Monthly insight
          </p>
          <p className="relative mt-1 text-[16px] font-bold leading-snug">
            Network tickets dropped 23% after the VPN profile rollout.
          </p>
          <button className="relative mt-3 h-9 px-4 rounded-full bg-white text-primary font-semibold text-[12px]">
            Read brief
          </button>
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}

function Stat({
  label,
  value,
  delta,
  good,
}: {
  label: string;
  value: string;
  delta: string;
  good?: boolean;
}) {
  const Icon = good ? TrendingDown : TrendingUp;
  return (
    <div className="rounded-3xl bg-card border border-border p-4 shadow-soft">
      <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
      <p className="mt-1 text-[22px] font-extrabold tracking-tight leading-none">{value}</p>
      <p
        className={`mt-2 text-[11px] font-semibold flex items-center gap-1 ${good ? "text-success" : "text-primary"}`}
      >
        <Icon className="h-3 w-3" /> {delta}
      </p>
    </div>
  );
}
