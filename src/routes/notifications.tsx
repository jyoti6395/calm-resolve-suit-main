import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { BottomNav } from "@/components/layout/BottomNav";
import { DesktopPageShell } from "@/components/layout/DesktopPageShell";
import { useHeaderSetup } from "@/components/layout/HeaderContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bell, Loader2, X, ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  startNotificationSyncListener,
  togglePreference,
  deleteNotification,
  clearAllNotifications,
} from "@/store/notificationSlice";
import {
  groupNotifications,
  getNotificationToneStyles,
  type NotificationItem,
} from "@/lib/notifications";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/notifications")({ component: Notifications });

function Notifications() {
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notifications, loading, preferences } = useAppSelector((state) => state.notifications);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleNotificationClick = (it: NotificationItem) => {
    if (it.ticketId) {
      navigate({ to: "/tickets/$id", params: { id: it.ticketId } });
    } else {
      navigate({ to: "/tickets", search: { status: "all" } });
    }
  };

  useEffect(() => {
    const unsubscribe = dispatch(startNotificationSyncListener());
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [dispatch]);

  // Group notifications using the utility helper
  const groups = groupNotifications(notifications);

  // Dynamically set sub-title based on count
  const unreadCount = notifications.length;
  const subtitleText = loading
    ? "Updating..."
    : unreadCount === 0
      ? "All caught up"
      : `${unreadCount} new`;

  const handleClearAll = async () => {
    try {
      await dispatch(clearAllNotifications());
      toast.success("All notifications cleared");
      setShowClearConfirm(false);
    } catch (err) {
      toast.error("Failed to clear notifications");
    }
  };

  useHeaderSetup(
    {
      title: "Notifications",
      subtitle: subtitleText,
      right:
        unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="px-3 py-1.5 rounded-full bg-secondary hover:bg-muted flex items-center justify-center text-[12px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Clear all
          </button>
        ) : undefined,
    },
    [loading, unreadCount],
  );

  // ─── DESKTOP LAYOUT ────────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <DesktopPageShell noPadding>
        <div className="flex flex-col h-full w-full bg-slate-50 min-h-screen">
          {/* Top Breadcrumb Header */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate({ to: "/" })}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-[18px] font-bold text-slate-800 tracking-tight">
                  Notifications
                </h1>
                <p className="text-[13px] text-slate-500 mt-0.5 font-medium">{subtitleText}</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[13px] font-semibold text-slate-600 hover:text-slate-900 shadow-sm transition-colors cursor-pointer shrink-0"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Main Layout Area */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-[1600px] w-full mx-auto animate-fade-in">
            <div className="w-full">
              <DesktopNotificationsContent
                loading={loading}
                notifications={notifications}
                groups={groups}
                preferences={preferences}
                dispatch={dispatch}
                onNotificationClick={handleNotificationClick}
              />
            </div>
          </div>
        </div>
        <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
          <AlertDialogContent className="rounded-2xl sm:rounded-3xl max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove all notifications from your feed. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearAll}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
              >
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DesktopPageShell>
    );
  }

  // ─── MOBILE LAYOUT — completely unchanged ─────────────────────────────────
  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-32">
        <MobileNotificationsContent
          loading={loading}
          notifications={notifications}
          groups={groups}
          preferences={preferences}
          dispatch={dispatch}
          onNotificationClick={handleNotificationClick}
        />
      </div>
      <BottomNav />
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent className="rounded-2xl sm:rounded-3xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all notifications from your feed. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileShell>
  );
}

// ─── Shared notifications content (used in both mobile and desktop) ────────────
function MobileNotificationsContent({
  loading,
  notifications,
  groups,
  preferences,
  dispatch,
  onNotificationClick,
}: {
  loading: boolean;
  notifications: ReturnType<
    typeof useAppSelector<
      { notifications: { notifications: unknown[] } }["notifications"]["notifications"]
    >
  >;
  groups: ReturnType<typeof groupNotifications>;
  preferences: Record<string, boolean>;
  dispatch: ReturnType<typeof useAppDispatch>;
  onNotificationClick: (it: NotificationItem) => void;
}) {
  const handleClearOne = async (id: string) => {
    try {
      await dispatch(deleteNotification(id));
      toast.success("Notification cleared");
    } catch {
      toast.error("Failed to clear notification");
    }
  };

  return (
    <>
      {loading && notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-[12px] text-muted-foreground mt-2">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6">
          <div className="h-16 w-16 rounded-3xl bg-secondary flex items-center justify-center text-muted-foreground mb-4">
            <Bell className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <h3 className="text-[14px] font-bold text-foreground">All caught up!</h3>
          <p className="text-[12px] text-muted-foreground mt-1 max-w-[240px] leading-normal">
            You have no new alerts in your notifications feed.
          </p>
        </div>
      ) : (
        <div className="px-5 space-y-6">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="text-[11px] font-bold tracking-wider text-muted-foreground">
                {g.title}
              </p>
              <div className="mt-3 space-y-2">
                {g.items.map((it) => {
                  const tone = getNotificationToneStyles(it.tone);
                  const Icon = it.icon;
                  return (
                    <div
                      key={it.id}
                      onClick={() => onNotificationClick(it)}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-card border border-border cursor-pointer hover:bg-muted/30 active:bg-muted/40 transition-colors"
                    >
                      <div
                        className={`h-10 w-10 rounded-xl ${tone.bg} flex items-center justify-center shrink-0`}
                      >
                        <Icon className={`h-4 w-4 ${tone.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-[13.5px] font-semibold">{it.title}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-muted-foreground">{it.time}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClearOne(it.id);
                              }}
                              className="h-5 w-5 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                              aria-label="Clear notification"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[12.5px] text-muted-foreground mt-0.5 leading-snug">
                          {it.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── DESKTOP NOTIFICATIONS CONTENT ─────────────────────────────────────────────
function DesktopNotificationsContent({
  loading,
  notifications,
  groups,
  preferences,
  dispatch,
  onNotificationClick,
}: {
  loading: boolean;
  notifications: ReturnType<
    typeof useAppSelector<
      { notifications: { notifications: unknown[] } }["notifications"]["notifications"]
    >
  >;
  groups: ReturnType<typeof groupNotifications>;
  preferences: Record<string, boolean>;
  dispatch: ReturnType<typeof useAppDispatch>;
  onNotificationClick: (it: NotificationItem) => void;
}) {
  const handleClearOne = async (id: string) => {
    try {
      await dispatch(deleteNotification(id));
      toast.success("Notification cleared");
    } catch {
      toast.error("Failed to clear notification");
    }
  };

  return (
    <div className="w-full">
      {loading && notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <p className="text-[13px] font-medium text-slate-500 mt-4">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 px-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-400 mb-6 border border-slate-100 shadow-inner">
            <Bell className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-[18px] font-extrabold text-slate-800">All caught up!</h3>
          <p className="text-[14px] text-slate-500 mt-2 max-w-[280px] font-medium leading-relaxed">
            You have no new alerts in your notifications feed.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="text-[12px] font-bold tracking-wider text-slate-500 mb-3 pl-2">
                {g.title}
              </p>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {g.items.map((it) => {
                  const tone = getNotificationToneStyles(it.tone);
                  const Icon = it.icon;
                  return (
                    <div
                      key={it.id}
                      onClick={() => onNotificationClick(it)}
                      className="flex items-start gap-4 p-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors group relative cursor-pointer"
                    >
                      <div
                        className={`h-11 w-11 rounded-xl ${tone.bg} flex items-center justify-center shrink-0`}
                      >
                        <Icon className={`h-5 w-5 ${tone.text}`} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-[15px] font-bold text-slate-805 leading-tight">
                            {it.title}
                          </p>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[12px] font-medium text-slate-400">
                              {it.time}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClearOne(it.id);
                              }}
                              className="h-7 w-7 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all cursor-pointer shrink-0"
                              aria-label="Clear notification"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[14px] text-slate-500 mt-1.5 leading-relaxed font-medium">
                          {it.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle?: () => void }) {
  return (
    <span
      onClick={onToggle}
      className={`h-6 w-10 rounded-full p-0.5 transition-colors cursor-pointer block ${on ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : ""}`}
      />
    </span>
  );
}
