import { ElementType } from "react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  trendText: string;
  trendPositive: boolean;
  trendShow: boolean;
  icon: ElementType;
  iconColor: string;
  iconBg: string;
}

export function MetricCard({
  title,
  value,
  trendText,
  trendPositive,
  trendShow,
  icon: Icon,
  iconColor,
  iconBg,
}: MetricCardProps) {
  return (
    <div className="rounded-sm bg-card border border-border/70 p-3.5 shadow-sm hover:shadow-soft transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between w-full">
        <div
          className={`h-8.5 w-8.5 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>

        {trendShow && (
          <span
            className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-full ${
              trendPositive
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                : "text-rose-600 dark:text-rose-400 bg-rose-500/10"
            }`}
          >
            {trendText}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase leading-none">
          {title}
        </p>
        <p className="mt-1.5 text-[19px] font-extrabold text-foreground leading-none tracking-tight">
          {value}
        </p>
        <p className="mt-1.5 text-[8.5px] text-muted-foreground/60 font-semibold tracking-wide uppercase leading-none">
          vs last month
        </p>
      </div>
    </div>
  );
}
