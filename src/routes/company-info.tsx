import { createFileRoute } from "@tanstack/react-router";
import { CompanyInfoView } from "@/features/settings/components/CompanyInfoView";

export const Route = createFileRoute("/company-info")({
  component: CompanyInfoView,
});
