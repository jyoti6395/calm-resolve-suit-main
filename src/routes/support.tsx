import { createFileRoute } from "@tanstack/react-router";
import { SupportView } from "@/features/settings/components/SupportView";

export const Route = createFileRoute("/support")({
  component: SupportView,
});
