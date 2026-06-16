import { createFileRoute } from "@tanstack/react-router";
import { NewPasswordForm } from "@/features/auth/components/NewPasswordForm";

export const Route = createFileRoute("/reset-password")({
  component: NewPasswordForm,
});
