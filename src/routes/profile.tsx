import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useHeaderSetup } from "@/components/HeaderContext";
import {
  Building2,
  Bell,
  Lock,
  Smartphone,
  Palette,
  History,
  HelpCircle,
  LogOut,
  ChevronRight,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { logOut as firebaseLogOut } from "@/services/authService";
import { EditProfileSheet } from "@/components/EditProfileSheet";

export const Route = createFileRoute("/profile")({ component: Profile });

const sections = [
  {
    title: "Account",
    items: [
      {
        icon: Building2,
        label: "Company information",
        hint: "Acme Corp · 1,240 seats",
        to: "/company-info",
      },
      // { icon: ShieldCheck, label: "Security & 2FA", hint: "Face ID enabled" },
      // { icon: Smartphone, label: "Linked devices", hint: "3 devices" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Bell, label: "Notifications", hint: "All alerts on", to: "/notifications" },
      // { icon: Palette, label: "Theme", hint: "System" },
      // { icon: History, label: "Activity log", hint: "Last 90 days" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help & support", hint: "Browse the help center", to: "/support" },
      { icon: Lock, label: "Privacy & terms", hint: "Read policies", to: "/privacy-terms" },
    ],
  },
];

function Profile() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);

  useHeaderSetup(
    {
      title: "Profile",
      right: (
        <button
          onClick={() => setIsEditOpen(true)}
          className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center cursor-pointer focus:outline-none"
        >
          <Pencil className="h-4 w-4" />
        </button>
      ),
    },
    [setIsEditOpen],
  );

  const handleLogout = async () => {
    try {
      await firebaseLogOut();
      navigate({ to: "/login" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const getInitials = () => {
    if (user?.displayName) {
      const parts = user.displayName.trim().split(" ");
      if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "US";
  };

  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-32">
        {/* Profile card */}
        <div className="mx-5 rounded-3xl bg-gradient-hero text-white p-5 shadow-elevated relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary-glow/40 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-[22px] font-extrabold">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-bold truncate">{user?.displayName || "Guest User"}</p>
              <p className="text-[12px] text-white/70 truncate">{user?.email || "Not logged in"}</p>
              <p className="text-[10px] text-white/60 mt-0.5 truncate">
                Personal · {user?.role || "Customer"}
              </p>
            </div>
          </div>
          <div className="relative grid grid-cols-3 gap-3 mt-5">
            {[
              { k: "Tickets", v: "12" },
              { k: "Resolved", v: "8" },
              { k: "Avg. rating", v: "4.9" },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl bg-white/10 backdrop-blur p-3 text-center">
                <p className="text-[16px] font-extrabold">{s.v}</p>
                <p className="text-[10px] text-white/60">{s.k}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 mt-6 space-y-6">
          {sections.map((sec) => (
            <div key={sec.title}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                {sec.title}
              </p>
              <div className="mt-3 rounded-2xl bg-card border border-border overflow-hidden">
                {sec.items.map((it, i) => {
                  const Icon = it.icon;
                  return (
                    <button
                      key={it.label}
                      onClick={() => "to" in it && navigate({ to: (it as { to: string }).to })}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors ${i !== sec.items.length - 1 ? "border-b border-border" : ""}`}
                    >
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-[13.5px] font-semibold">{it.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{it.hint}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 mt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-destructive/10 text-destructive font-semibold hover:bg-destructive/15 transition-colors focus:outline-none"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
          <p className="text-center text-[11px] text-muted-foreground/70 mt-4">
            AdviseTech v3.4.1 · SOC 2 Type II
          </p>
        </div>
      </div>
      <BottomNav />
      <EditProfileSheet isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </MobileShell>
  );
}
