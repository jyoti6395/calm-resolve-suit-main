import { createFileRoute } from "@tanstack/react-router";
import { OnboardingCarousel } from "@/features/onboarding/components/OnboardingCarousel";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingCarousel,
});
