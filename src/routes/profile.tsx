import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/layout/MobileShell";
import { DesktopPageShell } from "@/components/layout/DesktopPageShell";
import { useHeaderSetup } from "@/components/layout/HeaderContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Building2,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  // Pencil,
  Trash2,
  Loader2,
  User,
  SlidersHorizontal,
  Globe,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { logOut as firebaseLogOut, deleteAccount } from "@/services/authService";
import { EditProfileSheet } from "@/features/settings/components/EditProfileSheet";
import { UserProfileCard } from "@/features/settings/components/UserProfileCard";
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
    id: "account",
    title: "Account",
    sidebarIcon: UserCircle2,
    items: [
      {
        icon: Building2,
        label: "Company information",
        hint: "Acme Corp · 1,240 seats",
        to: "/company-info",
      },
    ],
  },
  {
    id: "preferences",
    title: "Preferences",
    sidebarIcon: SlidersHorizontal,
    items: [
      { icon: Bell, label: "Notifications", hint: "All alerts on", to: "/notifications" },
      // { icon: Globe, label: "Language & Region", hint: "English (US)", to: "/language" },
    ],
  },
  {
    id: "support",
    title: "Support",
    sidebarIcon: HelpCircle,
    items: [
      { icon: HelpCircle, label: "Help & support", hint: "Browse the help center", to: "/support" },
      { icon: ShieldCheck, label: "Privacy & terms", hint: "Read policies", to: "/privacy-terms" },
    ],
  },
];

function Profile() {
  const isMobile = useIsMobile();
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const getInitials = () => {
    if (user?.displayName) {
      const parts = user?.displayName.trim().split(" ");
      if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    return user?.email?.slice(0, 2).toUpperCase() || "US";
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      // Successful deletion. Firebase SDK deleteUser automatically triggers auth state changes,
      // which clears the Redux auth state. We navigate the user to /login as requested.
      navigate({ to: "/login" });
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
      setIsLogoutConfirmOpen(false);
      navigate({ to: "/login" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const deleteDialog = (
    <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
      <AlertDialogContent className="rounded-3xl border border-border bg-card p-6 max-w-sm w-[90%] mx-auto shadow-elevated">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-foreground text-center">
            Delete account?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] text-muted-foreground text-center mt-2 leading-relaxed">
            Permanently delete the account{" "}
            <span className="font-semibold text-foreground">{user?.email}</span>? This action cannot
            be undone.
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
  );

  const logoutDialog = (
    <AlertDialog open={isLogoutConfirmOpen} onOpenChange={setIsLogoutConfirmOpen}>
      <AlertDialogContent className="rounded-3xl border border-border bg-card p-6 max-w-sm w-[90%] mx-auto shadow-elevated">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-foreground text-center">
            Log out?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] text-muted-foreground text-center mt-2 leading-relaxed">
            Are you sure you want to log out of your account?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col gap-2 mt-4 sm:flex-col sm:space-x-0">
          <button
            onClick={handleLogout}
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors focus:outline-none flex items-center justify-center gap-2 cursor-pointer"
          >
            Yes, log out
          </button>
          <button
            onClick={() => setIsLogoutConfirmOpen(false)}
            className="w-full h-12 rounded-2xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-colors focus:outline-none cursor-pointer"
          >
            Cancel
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // ─── DESKTOP LAYOUT ────────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <>
        <DesktopPageShell noPadding>
          <div className="flex flex-col h-full w-full bg-slate-50 min-h-screen">
            {/* Top Breadcrumb Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white shrink-0">
              <div>
                <h1 className="text-[18px] font-bold text-slate-800 tracking-tight">
                  Profile & Settings
                </h1>
                <p className="text-[13px] text-slate-500 mt-0.5 font-medium">
                  Manage your user profile, credentials, and settings.
                </p>
              </div>
            </div>

            {/* Main Layout Area */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6 w-full items-start">
                {/* Left: User Hero Card (Sticky with reduced opacity) */}
                <div className="w-full relative overflow-hidden rounded-2xl p-6 xl:p-8 shadow-elevated border border-slate-200/10 md:sticky md:top-6 flex flex-col md:min-h-[480px]">
                  {/* Background layer with reduced opacity */}
                  <div className="absolute inset-0 bg-gradient-hero opacity-[0.85] pointer-events-none" />
                  {/* Decorative glow orb */}
                  <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary-glow/40 blur-3xl pointer-events-none" />

                  {/* Card Content (User Profile inside a white border box) */}
                  <div className="relative z-10 w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pt-12 pb-12 px-5 flex flex-col items-center text-center animate-scale-in">
                    <div className="h-16 w-16 rounded-xl bg-white/15 backdrop-blur border border-white/20 text-white flex items-center justify-center text-xl font-extrabold shadow-md mb-4">
                      {getInitials()}
                    </div>
                    <h2 className="text-[18px] font-extrabold text-white tracking-tight leading-tight">
                      {user?.displayName || "Guest User"}
                    </h2>
                    <div className="flex items-center gap-1.5 text-white/80 mt-3.5">
                      <UserCircle2 className="h-4 w-4 shrink-0 text-white/60" />
                      <span className="text-[13px] font-medium truncate max-w-[190px]">
                        {user?.email || "Not logged in"}
                      </span>
                    </div>
                  </div>

                  {/* Spacer to push company info to bottom and stretch height naturally */}
                  <div className="flex-1" />

                  {/* Divider Line */}
                  <div className="relative z-10 border-t border-white/10 w-full mb-6" />

                  {/* Company Info section matching the hero design */}
                  <div className="relative z-10 flex flex-col gap-3.5 text-white mb-2">
                    <div>
                      <h3 className="text-[16px] font-bold leading-tight tracking-tight">
                        Hans Organization
                      </h3>
                      <p className="text-[11.5px] text-white/60 mt-0.5 font-medium">
                        ID: ORG-2026-001
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3.5 text-[12px] border-t border-white/10">
                      <div>
                        <p className="text-white/50 text-[9px] tracking-wider font-semibold uppercase leading-none mb-1.5">
                          Subscription
                        </p>
                        <p className="text-white flex items-center gap-1 font-bold text-[13px] truncate">
                          <ShieldCheck className="h-4 w-4 text-primary-glow shrink-0" /> Enterprise
                        </p>
                      </div>
                      <div>
                        <p className="text-white/50 text-[9px] tracking-wider font-semibold uppercase leading-none mb-1.5">
                          Since
                        </p>
                        <p className="text-white font-bold text-[13px] truncate">Jan 15, 2021</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Settings Content */}
                <div className="w-full space-y-5">
                  {sections
                    .filter((sec) => sec.id !== "account")
                    .map((sec) => (
                      <div key={sec.title} id={sec.id} className="scroll-mt-6">
                        <p className="text-[11px] font-bold  tracking-wider text-slate-500 mb-2.5 pl-2">
                          {sec.title}
                        </p>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          {sec.items.map((it, i) => {
                            const Icon = it.icon;
                            return (
                              <button
                                key={it.label}
                                onClick={() =>
                                  "to" in it && navigate({ to: (it as { to: string }).to })
                                }
                                className={`w-full flex items-center gap-5 px-4 py-3.5 hover:bg-slate-50 transition-colors group text-left cursor-pointer ${
                                  i !== sec.items.length - 1 ? "border-b border-slate-100" : ""
                                }`}
                              >
                                <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 shadow-sm">
                                  <Icon className="h-5 w-5 text-slate-500 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex-1 text-left min-w-0 pt-0.5">
                                  <p className="text-[14.5px] font-bold text-slate-800 leading-tight">
                                    {it.label}
                                  </p>
                                  <p className="text-[12.5px] text-slate-500 mt-1 truncate font-medium">
                                    {it.hint}
                                  </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors mr-2" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                  {/* Actions Section styled as a Premium Category card */}
                  <div>
                    <p className="text-[11px] font-bold  tracking-wider text-slate-500 mb-2.5 pl-2">
                      Account Actions
                    </p>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <button
                        onClick={() => setIsLogoutConfirmOpen(true)}
                        className="w-full flex items-center gap-5 px-4 py-3.5 hover:bg-slate-50 transition-colors group text-left cursor-pointer border-b border-slate-100"
                      >
                        <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center shrink-0 shadow-sm">
                          <LogOut className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1 text-left min-w-0 pt-0.5">
                          <p className="text-[14.5px] font-bold text-slate-800">Log out</p>
                          <p className="text-[12.5px] text-slate-400 mt-1 font-medium">
                            Log out of your current session securely
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors mr-2" />
                      </button>

                      <button
                        onClick={() => {
                          setDeleteError(null);
                          setIsDeleteConfirmOpen(true);
                        }}
                        className="w-full flex items-center gap-5 px-4 py-3.5 hover:bg-red-50/50 transition-colors group text-left cursor-pointer"
                      >
                        <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 text-red-650 flex items-center justify-center shrink-0 shadow-sm">
                          <Trash2 className="h-4.5 w-4.5 text-red-600" />
                        </div>
                        <div className="flex-1 text-left min-w-0 pt-0.5">
                          <p className="text-[14.5px] font-bold text-red-600">Delete account</p>
                          <p className="text-[12.5px] text-red-400 mt-1 font-medium">
                            Permanently delete your profile and support history
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-red-600 transition-colors mr-2" />
                      </button>
                    </div>
                  </div>

                  {/* Version Info */}
                  <div className="pt-6 pb-2">
                    <p className="text-center text-[11px] font-bold tracking-widest  text-slate-400">
                      AdviseTech v3.4.1 · SOC 2 Type II
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DesktopPageShell>

        <EditProfileSheet isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
        {deleteDialog}
        {logoutDialog}
      </>
    );
  }

  // ─── MOBILE LAYOUT — completely unchanged ─────────────────────────────────
  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-8">
        <div className="px-5">
          <UserProfileCard onEditClick={() => setIsEditOpen(true)} />
        </div>

        <div className="px-5 mt-6 space-y-6">
          {sections.map((sec) => (
            <div key={sec.title}>
              <p className="text-[11px] font-bold  tracking-wider text-muted-foreground px-1">
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
            onClick={() => setIsLogoutConfirmOpen(true)}
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
      <EditProfileSheet isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
      {deleteDialog}
      {logoutDialog}
    </MobileShell>
  );
}
