import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export function SummaryCards({
  summary,
}: {
  summary: Array<{
    key: string;
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
    bg: string;
    statusFilter: string;
  }>;
}) {
  return (
    <div className="px-5 mt-5">
      <div className="grid grid-cols-2 gap-3">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              to="/tickets"
              search={{
                status: s.statusFilter as "open" | "in_progress" | "resolved" | "closed" | "all",
              }}
              key={s.key}
              className="rounded-[1.5rem] bg-card border border-border/80 p-3 shadow-sm hover:shadow-soft hover:-translate-y-0.5 active:scale-[0.98] transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full">
                <div className={`h-9 w-9 rounded-full ${s.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/45" />
              </div>
              <div className="mt-2.5">
                <p className="text-[24px] font-bold text-foreground leading-none">{s.value}</p>
                <p className="mt-1 text-[11.5px] text-muted-foreground font-medium">{s.label}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
