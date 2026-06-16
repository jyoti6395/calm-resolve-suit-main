import { createFileRoute } from "@tanstack/react-router";
import { PasswordResetForm } from "@/features/auth/components/PasswordResetForm";

export const Route = createFileRoute("/forgot-password")({
  component: PasswordResetForm,
});
