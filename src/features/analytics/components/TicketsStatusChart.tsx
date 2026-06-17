import { Link } from "@tanstack/react-router";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { StatusDistribution } from "../hooks/useAnalyticsData";

interface TicketsStatusChartProps {
  statusCounts: StatusDistribution;
  donutChartData: Array<{ name: string; value: number; color: string }>;
}

export function TicketsStatusChart({ statusCounts, donutChartData }: TicketsStatusChartProps) {
  return (
    <div className="mt-4 rounded-sm bg-card border border-border/70 p-4 shadow-sm hover:shadow-soft transition-all duration-200 shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-foreground">My Tickets by Status</h2>
        <Link
          to="/tickets"
          search={{ status: "all" }}
          className="text-[11.5px] text-primary font-bold hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="flex items-center justify-between mt-3 gap-1">
        {/* Donut Chart */}
        <div className="relative w-[110px] h-[110px] shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutChartData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={50}
                paddingAngle={statusCounts.total > 0 ? 3 : 0}
                dataKey="value"
              >
                {donutChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[17px] font-extrabold text-foreground leading-none">
              {statusCounts.total}
            </span>
            <span className="text-[8.5px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
              Total
            </span>
          </div>
        </div>

        {/* Legend breakdown list */}
        <div className="flex-1 flex flex-col gap-2 pl-3 justify-center">
          {statusCounts.total > 0 ? (
            statusCounts.data.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {s.name}
                  </span>
                </div>
                <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0 ml-1.5 text-[11.5px]">
                  {s.value} ({s.percentage}%)
                </span>
              </div>
            ))
          ) : (
            <div className="text-left py-2">
              <p className="text-[12px] text-muted-foreground italic">No tickets recorded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
