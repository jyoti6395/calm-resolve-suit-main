import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { BottomNav } from "@/components/layout/BottomNav";
import { useHeaderSetup } from "@/components/layout/HeaderContext";
import { Bell, Loader2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  startNotificationSyncListener,
  togglePreference,
  deleteNotification,
  clearAllNotifications,
} from "@/store/notificationSlice";
import { groupNotifications, getNotificationToneStyles } from "@/lib/notifications";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({ component: Notifications });

function Notifications() {
  const dispatch = useAppDispatch();
  const { notifications, loading, preferences } = useAppSelector((state) => state.notifications);

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
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-full bg-secondary hover:bg-muted flex items-center justify-center text-[12px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Clear all
          </button>
        ) : undefined,
    },
    [loading, unreadCount],
  );

  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-32">
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
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {g.title}
                </p>
                <div className="mt-3 space-y-2">
                  {g.items.map((it) => {
                    const tone = getNotificationToneStyles(it.tone);
                    const Icon = it.icon;
                    return (
                      <div
                        key={it.id}
                        className="flex items-start gap-3 p-3.5 rounded-2xl bg-card border border-border"
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
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await dispatch(deleteNotification(it.id));
                                    toast.success("Notification cleared");
                                  } catch (err) {
                                    toast.error("Failed to clear notification");
                                  }
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

        <div className="mx-5 mt-6 rounded-3xl bg-card border border-border p-4">
          <p className="text-[13px] font-bold">Notification preferences</p>
          <div className="mt-3 space-y-2">
            {[
              // { key: "slaAlerts" as const, label: "SLA alerts" },
              { key: "newReplies" as const, label: "New replies" },
              { key: "statusChanges" as const, label: "Status changes" },
              { key: "weeklyDigest" as const, label: "Weekly digest" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-[13px]">{label}</span>
                <Toggle on={preferences[key]} onToggle={() => dispatch(togglePreference(key))} />
              </label>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileShell>
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
