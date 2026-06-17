import { useNavigate } from "@tanstack/react-router";
import { useAppSelector } from "@/store/hooks";
import { MobileShell } from "@/components/layout/MobileShell";
import { BottomNav } from "@/components/layout/BottomNav";
import { useHeaderSetup } from "@/components/layout/HeaderContext";
import type { Ticket } from "@/types/store";
import { useAnalyticsData } from "../hooks/useAnalyticsData";
import { StatsGrid } from "./StatsGrid";
import { TicketsStatusChart } from "./TicketsStatusChart";
import { RecentTicketsSection } from "./RecentTicketsSection";

// =========================================
// MAIN COMPONENT
// =========================================

export function AnalyticsView({
  searchParams,
}: {
  searchParams: { timeframe?: "this_month" | "this_week" | "today" };
}) {
  const navigate = useNavigate({ from: "/analytics" });
  const tickets = useAppSelector((state) => state.tickets.tickets) as Ticket[];

  const timeframe = searchParams.timeframe || "this_month";

  const tabs = [
    { key: "today", label: "Today" },
    { key: "this_week", label: "This Week" },
    { key: "this_month", label: "This Month" },
  ] as const;

  // =========================================
  // DYNAMIC DATA FROM CUSTOM HOOK
  // =========================================
  const { currentPeriodTickets, stats, statusCounts, donutChartData, recentTickets } =
    useAnalyticsData(tickets, timeframe);

  // =========================================
  // REGISTER GLOBAL HEADER SETUP
  // =========================================
  useHeaderSetup(
    {
      title: "Insights",
      subtitle: `${currentPeriodTickets.length} assigned tickets`,
    },
    [currentPeriodTickets.length],
  );

  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-32 px-4 flex flex-col w-full max-w-md mx-auto">
        {/* =========================================
            1. SEGMENTED TIME CONSTRAINTS TABS
           ========================================= */}
        <div className="mt-4 shrink-0 bg-secondary/60 dark:bg-muted p-1 rounded-2xl flex items-center w-full shadow-inner">
          {tabs.map((t) => {
            const active = timeframe === t.key;
            return (
              <button
                key={t.key}
                onClick={() => {
                  navigate({
                    search: (prev) => ({ ...prev, timeframe: t.key }),
                    replace: true,
                  });
                }}
                className={`flex-1 text-center py-2 text-[12.5px] font-bold rounded-xl transition-all cursor-pointer ${
                  active
                    ? "bg-white dark:bg-card text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* =========================================
            2. STATS CARDS GRID (4 ITEMS)
           ========================================= */}
        <StatsGrid stats={stats} />

        {/* =========================================
            3. MY TICKETS BY STATUS
           ========================================= */}
        <TicketsStatusChart statusCounts={statusCounts} donutChartData={donutChartData} />

        {/* =========================================
            4. RECENT TICKETS SECTION
           ========================================= */}
        <RecentTicketsSection recentTickets={recentTickets} />
      </div>

      <BottomNav />
    </MobileShell>
  );
}
