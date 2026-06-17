import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AnalyticsView } from "../features/analytics/components/AnalyticsView";

const analyticsSearchSchema = z.object({
  timeframe: z.enum(["this_month", "this_week", "today"]).optional().default("this_month"),
});

export type AnalyticsSearchParams = z.infer<typeof analyticsSearchSchema>;

function AnalyticsRoute() {
  const searchParams = Route.useSearch();
  return <AnalyticsView searchParams={searchParams} />;
}

export const Route = createFileRoute("/analytics")({
  validateSearch: (search) => analyticsSearchSchema.parse(search),
  component: AnalyticsRoute,
});
