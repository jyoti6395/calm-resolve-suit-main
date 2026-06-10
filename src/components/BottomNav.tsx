import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Ticket, BarChart3, Bell, User } from "lucide-react";

const items = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/tickets", icon: Ticket, label: "Tickets" },
  { to: "/analytics", icon: BarChart3, label: "Insights" },
  { to: "/notifications", icon: Bell, label: "Alerts" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40 pb-[env(safe-area-inset-bottom)]">
      <div className=" glass px-2 py-2 flex items-center justify-between">
        {items.map(({ to, icon: Icon, label }) => {
          const active = path === to || (to !== "/dashboard" && path.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl transition-all"
            >
              <div
                className={`flex items-center justify-center h-9 w-12 rounded-2xl transition-all ${active ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground"}`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
