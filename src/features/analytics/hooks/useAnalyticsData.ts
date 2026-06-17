import { useMemo } from "react";
import type { Ticket } from "@/types/store";

export interface AnalyticsStats {
  assigned: number;
  assignedTrend: string;
  assignedTrendPositive: boolean;
  assignedTrendShow: boolean;
  resolved: number;
  resolvedTrend: string;
  resolvedTrendPositive: boolean;
  resolvedTrendShow: boolean;
  avgResolution: string;
  avgResolutionTrend: string;
  avgResolutionTrendPositive: boolean;
  avgResolutionTrendShow: boolean;
  slaCompliance: string;
  slaTrend: string;
  slaTrendPositive: boolean;
  slaTrendShow: boolean;
}

export interface StatusDistributionItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface StatusDistribution {
  total: number;
  data: StatusDistributionItem[];
}

export function useAnalyticsData(
  tickets: Ticket[],
  timeframe: "this_month" | "this_week" | "today",
) {
  // =========================================
  // 1. TIMEFRAME FILTERING LOGIC
  // =========================================
  const { currentPeriodTickets, prevPeriodTickets } = useMemo(() => {
    const now = new Date();

    const parseTicketDate = (dateStr?: string | null) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    };

    // Calculate dynamic dates
    // - Today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

    // - This Week (Starts Monday 00:00:00)
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfThisWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + diffToMonday,
    );
    startOfThisWeek.setHours(0, 0, 0, 0);
    const startOfLastWeek = new Date(startOfThisWeek.getTime() - 7 * 24 * 60 * 60 * 1000);

    // - This Month
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    let curr: Ticket[] = [];
    let prev: Ticket[] = [];

    if (timeframe === "today") {
      curr = tickets.filter((t) => {
        const d = parseTicketDate(t.createdAt);
        return d !== null && d >= startOfToday;
      });
      prev = tickets.filter((t) => {
        const d = parseTicketDate(t.createdAt);
        return d !== null && d >= startOfYesterday && d < startOfToday;
      });
    } else if (timeframe === "this_week") {
      curr = tickets.filter((t) => {
        const d = parseTicketDate(t.createdAt);
        return d !== null && d >= startOfThisWeek;
      });
      prev = tickets.filter((t) => {
        const d = parseTicketDate(t.createdAt);
        return d !== null && d >= startOfLastWeek && d < startOfThisWeek;
      });
    } else {
      // timeframe === "this_month"
      curr = tickets.filter((t) => {
        const d = parseTicketDate(t.createdAt);
        return d !== null && d >= startOfThisMonth;
      });
      prev = tickets.filter((t) => {
        const d = parseTicketDate(t.createdAt);
        return d !== null && d >= startOfLastMonth && d <= endOfLastMonth;
      });
    }

    return { currentPeriodTickets: curr, prevPeriodTickets: prev };
  }, [tickets, timeframe]);

  // =========================================
  // 2. METRICS & TRENDS CALCULATIONS
  // =========================================
  const stats = useMemo<AnalyticsStats>(() => {
    // Assigned
    const currentAssigned = currentPeriodTickets.length;
    const prevAssigned = prevPeriodTickets.length;
    const assignedDiff = currentAssigned - prevAssigned;
    const assignedPct = prevAssigned > 0 ? Math.round((assignedDiff / prevAssigned) * 100) : 0;
    const assignedTrendText =
      prevAssigned > 0
        ? `${assignedDiff >= 0 ? "↑" : "↓"} ${Math.abs(assignedPct)}%`
        : `${currentAssigned > 0 ? "↑ 100%" : "0%"}`;

    // Resolved
    const currentResolved = currentPeriodTickets.filter(
      (t) => t.status === "resolved" || t.status === "closed",
    ).length;
    const prevResolved = prevPeriodTickets.filter(
      (t) => t.status === "resolved" || t.status === "closed",
    ).length;
    const resolvedDiff = currentResolved - prevResolved;
    const resolvedPct = prevResolved > 0 ? Math.round((resolvedDiff / prevResolved) * 100) : 0;
    const resolvedTrendText =
      prevResolved > 0
        ? `${resolvedDiff >= 0 ? "↑" : "↓"} ${Math.abs(resolvedPct)}%`
        : `${currentResolved > 0 ? "↑ 100%" : "0%"}`;

    // Avg Resolution Time
    const getAvgTimeMs = (list: Ticket[]) => {
      const resolvedList = list.filter(
        (t) => (t.status === "resolved" || t.status === "closed") && t.createdAt && t.updatedAt,
      );
      if (resolvedList.length === 0) return 0;
      const totalMs = resolvedList.reduce((acc, t) => {
        const diff = new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime();
        return acc + (diff > 0 ? diff : 0);
      }, 0);
      return totalMs / resolvedList.length;
    };

    const currentAvgMs = getAvgTimeMs(currentPeriodTickets);
    const prevAvgMs = getAvgTimeMs(prevPeriodTickets);

    const formatMsToText = (ms: number) => {
      if (ms <= 0) return "N/A";
      const totalMins = Math.floor(ms / (1000 * 60));
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const avgResolutionText = formatMsToText(currentAvgMs);
    const avgDiff = currentAvgMs - prevAvgMs;
    const avgPct = prevAvgMs > 0 ? Math.round((avgDiff / prevAvgMs) * 100) : 0;
    const avgTrendText = prevAvgMs > 0 ? `${avgDiff <= 0 ? "↓" : "↑"} ${Math.abs(avgPct)}%` : "0%";
    const avgTrendImproved = avgDiff <= 0;

    // SLA Compliance
    const getSlaStats = (list: Ticket[]) => {
      if (list.length === 0) return null;
      const compliantCount = list.filter((t) => {
        if (!t.slaDeadline) return true;
        const deadline = new Date(t.slaDeadline).getTime();
        if (t.status === "resolved" || t.status === "closed") {
          return new Date(t.updatedAt).getTime() <= deadline;
        }
        return new Date().getTime() <= deadline;
      }).length;
      return Math.round((compliantCount / list.length) * 100);
    };

    const currentSlaRate = getSlaStats(currentPeriodTickets);
    const prevSlaRate = getSlaStats(prevPeriodTickets);

    let slaTrendText = "0%";
    let slaTrendPositive = true;
    if (currentSlaRate !== null && prevSlaRate !== null) {
      const slaDiff = currentSlaRate - prevSlaRate;
      slaTrendText = `${slaDiff >= 0 ? "↑" : "↓"} ${Math.abs(slaDiff)}%`;
      slaTrendPositive = slaDiff >= 0;
    }

    return {
      assigned: currentAssigned,
      assignedTrend: assignedTrendText,
      assignedTrendPositive: assignedDiff >= 0,
      assignedTrendShow: prevAssigned > 0,

      resolved: currentResolved,
      resolvedTrend: resolvedTrendText,
      resolvedTrendPositive: resolvedDiff >= 0,
      resolvedTrendShow: prevResolved > 0,

      avgResolution: avgResolutionText,
      avgResolutionTrend: avgTrendText,
      avgResolutionTrendPositive: avgTrendImproved,
      avgResolutionTrendShow: prevAvgMs > 0 && currentAvgMs > 0,

      slaCompliance: currentSlaRate !== null ? `${currentSlaRate}%` : "N/A",
      slaTrend: slaTrendText,
      slaTrendPositive: slaTrendPositive,
      slaTrendShow: currentSlaRate !== null && prevSlaRate !== null,
    };
  }, [currentPeriodTickets, prevPeriodTickets]);

  // =========================================
  // 3. DONUT CHART BREAKDOWN
  // =========================================
  const statusCounts = useMemo<StatusDistribution>(() => {
    let open = 0;
    let inProgress = 0;
    let resolved = 0;
    let closed = 0;

    currentPeriodTickets.forEach((t) => {
      const s = t.status?.toLowerCase();
      if (s === "open") open++;
      else if (s === "in_progress" || s === "pending" || s === "waiting") inProgress++;
      else if (s === "resolved") resolved++;
      else if (s === "closed") closed++;
    });

    const total = open + inProgress + resolved + closed;

    if (total === 0) {
      return {
        total: 0,
        data: [],
      };
    }

    return {
      total: total,
      data: [
        {
          name: "Open",
          value: open,
          percentage: Math.round((open / total) * 100),
          color: "#2563eb",
        },
        {
          name: "In Progress",
          value: inProgress,
          percentage: Math.round((inProgress / total) * 100),
          color: "#f97316",
        },
        {
          name: "Resolved",
          value: resolved,
          percentage: Math.round((resolved / total) * 100),
          color: "#8b5cf6",
        },
        {
          name: "Closed",
          value: closed,
          percentage: Math.round((closed / total) * 100),
          color: "#0d9488",
        },
      ],
    };
  }, [currentPeriodTickets]);

  const donutChartData = useMemo(() => {
    if (statusCounts.total === 0) {
      return [{ name: "No tickets", value: 1, color: "#e2e8f0" }];
    }
    return statusCounts.data;
  }, [statusCounts]);

  // =========================================
  // 4. RECENT TICKETS (3 ITEMS)
  // =========================================
  const recentTickets = useMemo(() => {
    return [...currentPeriodTickets]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [currentPeriodTickets]);

  return {
    currentPeriodTickets,
    stats,
    statusCounts,
    donutChartData,
    recentTickets,
  };
}
