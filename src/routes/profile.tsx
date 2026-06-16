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
  Trash2,
  Loader2,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { logOut as firebaseLogOut, deleteAccount } from "@/services/authService";
import { EditProfileSheet } from "@/components/EditProfileSheet";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      // Successful deletion. Firebase SDK deleteUser automatically triggers auth state changes,
      // which clears the Redux auth state. We navigate the user to /signup as requested.
      navigate({ to: "/signup" });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error("Failed to delete account:", error);
      if (error.code === "auth/requires-recent-login") {
        setDeleteError(
          "For security reasons, deleting your account requires recent sign-in. Please log out, log back in, and try again.",
        );
      } else {
        setDeleteError(error.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  useHeaderSetup(
    {
      title: "Profile",
    },
    [],
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
            <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-[22px] font-extrabold text-white">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-bold truncate">{user?.displayName || "Guest User"}</p>
              <p className="text-[12px] text-white/70 truncate">{user?.email || "Not logged in"}</p>
              <p className="text-[10px] text-white/60 mt-0.5 truncate">
                Personal · {user?.role || "Customer"}
              </p>
            </div>
            <button
              onClick={() => setIsEditOpen(true)}
              className="h-10 w-10 shrink-0 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/25 active:scale-95 transition-all focus:outline-none"
            >
              <Pencil className="h-4 w-4 text-white" />
            </button>
          </div>
          {/* <div className="relative grid grid-cols-3 gap-3 mt-5">
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
          </div> */}
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
            className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-destructive/10 text-destructive font-semibold hover:bg-destructive/15 transition-colors focus:outline-none cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
          <div className="my-4 border-t border-border" />
          <button
            onClick={() => {
              setDeleteError(null);
              setIsDeleteConfirmOpen(true);
            }}
            className="w-full mt-3 flex items-center justify-center gap-2 h-14 text-destructive "
          >
            <Trash2 className="h-4 w-4" /> Delete account
          </button>

          <p className="text-center text-[11px] text-muted-foreground/70 mt-4">
            AdviseTech v3.4.1 · SOC 2 Type II
          </p>
        </div>
      </div>
      <BottomNav />
      <EditProfileSheet isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-3xl border border-border bg-card p-6 max-w-sm w-[90%] mx-auto shadow-elevated">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground text-center">
              Delete account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-muted-foreground text-center mt-2 leading-relaxed">
              This action is permanent and cannot be undone. All your profile information will be
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-[12px] font-medium rounded-xl text-center leading-relaxed">
              {deleteError}
            </div>
          )}

          <AlertDialogFooter className="flex flex-col gap-2 mt-4 sm:flex-col sm:space-x-0">
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="w-full h-12 rounded-2xl bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 transition-colors focus:outline-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                "Yes, delete my account"
              )}
            </button>
            <button
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={isDeleting}
              className="w-full h-12 rounded-2xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Cancel
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileShell>
  );
}
