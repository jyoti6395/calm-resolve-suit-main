import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/layout/MobileShell";
import { BottomNav } from "@/components/layout/BottomNav";
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
  Pencil,
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
      {
        icon: Lock,
        label: "Security",
        hint: "Password, 2FA",
        to: "/security",
      },
    ],
  },
  {
    id: "preferences",
    title: "Preferences",
    sidebarIcon: SlidersHorizontal,
    items: [
      { icon: Bell, label: "Notifications", hint: "All alerts on", to: "/notifications" },
      { icon: Globe, label: "Language & Region", hint: "English (US)", to: "/language" },
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
  const [activeSection, setActiveSection] = useState("account");

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
        <DesktopPageShell title="Profile & Settings">
          <div className="max-w-[900px] mx-auto w-full pb-16 pt-4">
            {/* Top: User Hero Card */}
            <div className="w-full mb-12 bg-gradient-hero rounded-[2rem] p-8 shadow-lg relative overflow-hidden flex items-center justify-between">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary-glow/40 blur-3xl" />
              <div className="relative flex items-center gap-6">
                <div className="relative">
                  <div className="h-20 w-20 rounded-[1.25rem] bg-white/15 backdrop-blur border border-white/20 text-white flex items-center justify-center text-[24px] font-extrabold shadow-md">
                    {getInitials()}
                  </div>
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="absolute -bottom-2 -right-2 h-8 w-8 bg-white/15 backdrop-blur rounded-full border border-white/20 shadow-sm flex items-center justify-center hover:bg-white/25 transition-all cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
                <div>
                  <h2 className="text-[24px] font-extrabold text-white tracking-tight leading-tight">
                    {user?.displayName || "Guest User"}
                  </h2>
                  <div className="flex items-center gap-2 text-white/80 mt-1.5">
                    <UserCircle2 className="h-4 w-4" />
                    <span className="text-[14px] font-medium">
                      {user?.email || "Not logged in"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur">
                <User className="h-4 w-4" />
                <span className="text-[13px] font-bold">Personal customer</span>
              </div>
            </div>

            {/* Bottom: Split Grid for Nav and Settings */}
            <div className="grid grid-cols-[220px_1fr] gap-12 w-full items-start">
              {/* Left Sidebar Menu */}
              <div className="w-full shrink-0 sticky top-6 space-y-1.5">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSection(sec.id);
                      document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer font-bold text-[14px] ${
                      activeSection === sec.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100/80"
                    }`}
                  >
                    <sec.sidebarIcon
                      className={`h-4 w-4 ${activeSection === sec.id ? "text-blue-600" : "text-slate-500"}`}
                    />
                    {sec.title}
                  </button>
                ))}
              </div>

              {/* Right Settings Content */}
              <div className="w-full space-y-12">
                {sections.map((sec) => (
                  <div key={sec.title} id={sec.id} className="scroll-mt-8">
                    <p className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-4 pl-1">
                      {sec.title}
                    </p>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-2">
                      {sec.items.map((it, i) => {
                        const Icon = it.icon;
                        return (
                          <button
                            key={it.label}
                            onClick={() =>
                              "to" in it && navigate({ to: (it as { to: string }).to })
                            }
                            className={`w-full flex items-center gap-5 px-4 py-4 rounded-2xl hover:bg-slate-50 transition-colors group`}
                          >
                            <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center shrink-0 shadow-sm">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 text-left min-w-0 pt-0.5">
                              <p className="text-[15px] font-bold text-slate-800 leading-tight">
                                {it.label}
                              </p>
                              <p className="text-[13px] text-slate-500 mt-1 truncate font-medium">
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

                {/* Actions */}
                <div className="pt-6 space-y-4">
                  <button
                    onClick={() => setIsLogoutConfirmOpen(true)}
                    className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 shadow-sm transition-colors focus:outline-none cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                  <button
                    onClick={() => {
                      setDeleteError(null);
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-white border border-red-100 text-red-600 font-bold hover:bg-red-50 shadow-sm transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" /> Delete account
                  </button>
                  <div className="pt-8">
                    <p className="text-center text-[11px] font-bold tracking-widest uppercase text-slate-400">
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
      <div className="min-h-screen bg-background pb-32">
        <div className="px-5">
          <UserProfileCard onEditClick={() => setIsEditOpen(true)} />
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
      <BottomNav />
      <EditProfileSheet isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
      {deleteDialog}
      {logoutDialog}
    </MobileShell>
  );
}
