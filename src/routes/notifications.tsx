import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useHeaderSetup } from "@/components/HeaderContext";
import { Settings2, Bell, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { startNotificationSyncListener, togglePreference } from "@/store/notificationSlice";
import { groupNotifications, getNotificationToneStyles } from "@/lib/notifications";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export const Route = createFileRoute("/notifications")({ component: Notifications });

function Notifications() {
  const dispatch = useAppDispatch();
  const { notifications, loading, preferences } = useAppSelector((state) => state.notifications);
  const user = useAppSelector((state) => state.auth.user);
  const [generating, setGenerating] = useState(false);

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

  useHeaderSetup(
    {
      title: "Notifications",
      subtitle: subtitleText,
      right: (
        <button className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
          <Settings2 className="h-4 w-4" />
        </button>
      ),
    },
    [loading, unreadCount],
  );

  const handleGenerateDemo = async () => {
    if (!user) return;
    setGenerating(true);
    const demoItems = [
      {
        title: "SLA breach risk",
        body: "AT-2835 has 32 minutes remaining.",
        tone: "destructive" as const,
        createdAt: new Date().toISOString(),
        userId: user.uid,
        read: false,
      },
      {
        title: "New reply on AT-2841",
        body: "Priya: Profile update pushed — try reconnecting.",
        tone: "primary" as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(), // 14m ago
        userId: user.uid,
        read: false,
      },
      {
        title: "Ticket resolved",
        body: "AT-2828 marked as resolved by Sam Kim.",
        tone: "success" as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1d ago
        userId: user.uid,
        read: false,
      },
    ];

    for (const item of demoItems) {
      try {
        await addDoc(collection(db, "notifications"), item);
      } catch (err) {
        console.warn("Failed to write to root notifications, trying subcollection...", err);
        try {
          await addDoc(collection(db, "users", user.uid, "notifications"), item);
        } catch (subErr) {
          console.error("Failed to add demo notification in both locations:", subErr);
        }
      }
    }
    setGenerating(false);
  };

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
            <button
              onClick={handleGenerateDemo}
              disabled={generating}
              className="mt-5 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {generating ? "Generating..." : "Generate Demo Alerts"}
            </button>
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
                          <div className="flex justify-between gap-2">
                            <p className="text-[13.5px] font-semibold">{it.title}</p>
                            <span className="text-[11px] text-muted-foreground shrink-0">
                              {it.time}
                            </span>
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
