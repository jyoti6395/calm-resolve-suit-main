import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/features/auth/components/LoginForm";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Field({ icon: Icon, trailing, ...props }: any) {
  return (
    <label className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card transition-all">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
      <input
        {...props}
        className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground/70"
      />
      {trailing}
    </label>
  );
}
