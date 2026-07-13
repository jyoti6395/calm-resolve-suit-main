import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Ticket,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  BarChart3,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { getUserRoles } from "@/lib/utils";

const STORAGE_KEY = "advisetech_sidebar_collapsed";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/tickets", icon: Ticket, label: "Tickets" },
  { to: "/analytics", icon: BarChart3, label: "Insights" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

function getInitials(displayName?: string | null, email?: string | null): string {
  if (displayName) {
    const parts = displayName.trim().split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "AP";
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFirstName(displayName?: string | null, email?: string | null): string {
  if (displayName) {
    return displayName.trim().split(" ")[0];
  }
  if (email) {
    return email.split("@")[0];
  }
  return "User";
}

export function DesktopSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAppSelector((state) => state.auth);
  const { isTechnician } = getUserRoles(user?.role);

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 768 && width <= 1024) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // localStorage unavailable — silently ignore
    }
  }, [collapsed]);

  const initials = getInitials(user?.displayName, user?.email);
  const firstName = getFirstName(user?.displayName, user?.email);
  const greeting = getGreeting();

  return (
    <aside
      className={`relative flex flex-col h-screen bg-slate-50 border-r border-border shrink-0 transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center justify-between px-4 pt-5 pb-3 shrink-0 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="shrink-0">
            <Logo size={40} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[17px] font-bold text-foreground tracking-tight leading-none mb-1">
                AdviseTech
              </span>
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider leading-none">
                {greeting}, {firstName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action */}
      <div className={`px-4 pb-5 pt-2 shrink-0 ${collapsed ? "flex justify-center px-2" : ""}`}>
        <Link
          to="/tickets/new"
          title={collapsed ? "New Request" : undefined}
          className={`flex items-center justify-center h-11 rounded-full bg-primary text-primary-foreground font-semibold shadow-elevated hover:shadow-glow transition-all w-full ${
            collapsed ? "w-11 px-0" : "px-4 gap-2"
          }`}
        >
          <Plus className="h-5 w-5 shrink-0" strokeWidth={2.5} />
          {!collapsed && <span className="text-[15px]">New Request</span>}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-1 px-4">
        {navItems.map(({ to, icon: Icon, label }) => {
          if (to === "/analytics" && !isTechnician) return null;

          const active = path === to || (to !== "/dashboard" && path.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3.5 h-11 transition-all group relative ${
                active
                  ? "bg-white shadow-sm text-blue-600 font-semibold"
                  : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900"
              } ${collapsed ? "justify-center" : "mx-2"}`}
            >
              <Icon
                className={`h-[18px] w-[18px] shrink-0 ${active ? "text-primary" : ""}`}
                strokeWidth={active ? 2.5 : 2}
              />
              {!collapsed && (
                <span
                  className={`text-[13.5px] whitespace-nowrap ${active ? "font-semibold" : "font-medium"}`}
                >
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area: Settings & Profile */}
      <div className="mt-auto flex flex-col shrink-0 px-2 py-3 border-t border-border">
        {/* User Profile */}
        <div className={`flex items-center gap-3 px-2 ${collapsed ? "justify-center" : ""}`}>
          <div
            title={collapsed ? user?.displayName || user?.email || "Profile" : undefined}
            className="h-9 w-9 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center text-[13px] font-bold shrink-0 cursor-default"
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-foreground truncate leading-tight">
                {user?.displayName || "User"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                Support Agent
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle button */}
      <div
        className={`border-t border-border px-2 py-2 shrink-0 ${collapsed ? "flex justify-center" : ""}`}
      >
        <Button
          variant="ghost"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex items-center gap-2 rounded-xl h-9 text-muted-foreground hover:bg-muted hover:text-foreground transition-all w-full cursor-pointer ${
            collapsed ? "justify-center px-0 w-9" : "px-3"
          }`}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="text-[12.5px] font-medium">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
