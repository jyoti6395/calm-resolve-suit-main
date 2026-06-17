import { Ticket as TicketIcon, CheckCircle2, Clock, Target } from "lucide-react";
import { MetricCard } from "./MetricCard";
import type { AnalyticsStats } from "../hooks/useAnalyticsData";

interface StatsGridProps {
  stats: AnalyticsStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-4 shrink-0">
      <MetricCard
        title="Assigned"
        value={stats.assigned}
        trendText={stats.assignedTrend}
        trendPositive={stats.assignedTrendPositive}
        trendShow={stats.assignedTrendShow}
        icon={TicketIcon}
        iconColor="text-blue-600 dark:text-blue-400"
        iconBg="bg-blue-50 dark:bg-blue-950/20"
      />
      <MetricCard
        title="Resolved"
        value={stats.resolved}
        trendText={stats.resolvedTrend}
        trendPositive={stats.resolvedTrendPositive}
        trendShow={stats.resolvedTrendShow}
        icon={CheckCircle2}
        iconColor="text-emerald-600 dark:text-emerald-400"
        iconBg="bg-emerald-50 dark:bg-emerald-950/20"
      />
      <MetricCard
        title="Avg. Resolution Time"
        value={stats.avgResolution}
        trendText={stats.avgResolutionTrend}
        trendPositive={stats.avgResolutionTrendPositive}
        trendShow={stats.avgResolutionTrendShow}
        icon={Clock}
        iconColor="text-purple-600 dark:text-purple-400"
        iconBg="bg-purple-50 dark:bg-purple-950/20"
      />
      <MetricCard
        title="SLA Compliance"
        value={stats.slaCompliance}
        trendText={stats.slaTrend}
        trendPositive={stats.slaTrendPositive}
        trendShow={stats.slaTrendShow}
        icon={Target}
        iconColor="text-amber-600 dark:text-amber-400"
        iconBg="bg-amber-50 dark:bg-amber-950/20"
      />
    </div>
  );
}
