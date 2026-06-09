import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "../pages/Login";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

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

