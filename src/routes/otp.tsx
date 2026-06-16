import { createFileRoute } from "@tanstack/react-router";
import { OTPVerification } from "@/features/auth/components/OTPVerification";

export const Route = createFileRoute("/otp")({
  component: OTPVerification,
});
