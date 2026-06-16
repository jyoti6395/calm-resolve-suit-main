import { createFileRoute } from "@tanstack/react-router";
import { SplashHero } from "@/features/onboarding/components/SplashHero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AdviseTech — Secure IT Support" },
      {
        name: "description",
        content: "Enterprise IT support & ticket management with real-time chat and analytics.",
      },
    ],
  }),
  component: SplashHero,
});
