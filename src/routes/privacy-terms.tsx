import { createFileRoute } from "@tanstack/react-router";
import { PrivacyTermsView } from "@/features/settings/components/PrivacyTermsView";

export const Route = createFileRoute("/privacy-terms")({
  component: PrivacyTermsView,
});
