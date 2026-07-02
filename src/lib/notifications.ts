import { AlertTriangle, CheckCircle2, MessageSquare, Wrench, type LucideIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { DbNotification } from "@/store/notificationSlice";

export type NotificationTone = "destructive" | "primary" | "success" | "warning";

export interface NotificationItem {
  id: string;
  icon: LucideIcon;
  tone: NotificationTone;
  title: string;
  body: string;
  time: string;
  createdAt: string;
  ticketId?: string;
}

export interface NotificationGroup {
  title: string;
  items: NotificationItem[];
}

export const toneStyles: Record<NotificationTone, { bg: string; text: string }> = {
  destructive: { bg: "bg-destructive/12", text: "text-destructive" },
  primary: { bg: "bg-primary/10", text: "text-primary" },
  success: { bg: "bg-success/15", text: "text-success" },
  warning: { bg: "bg-warning/15", text: "text-warning" },
};

export function getNotificationToneStyles(tone: NotificationTone): { bg: string; text: string } {
  return toneStyles[tone] || toneStyles.primary;
}

export function getNotificationIcon(tone: NotificationTone): LucideIcon {
  switch (tone) {
    case "destructive":
      return AlertTriangle;
    case "success":
      return CheckCircle2;
    case "warning":
      return Wrench;
    case "primary":
    default:
      return MessageSquare;
  }
}

export function groupNotifications(notifications: DbNotification[]): NotificationGroup[] {
  const items = notifications.map((n) => {
    let timeStr = "";
    try {
      if (n.createdAt) {
        const date = new Date(n.createdAt);
        if (!isNaN(date.getTime())) {
          timeStr = formatDistanceToNow(date, { addSuffix: false })
            .replace("about ", "")
            .replace("less than a minute", "1m")
            .replace(" minutes", "m")
            .replace(" minute", "m")
            .replace(" hours", "h")
            .replace(" hour", "h")
            .replace(" days", "d")
            .replace(" day", "d");
        }
      }
    } catch (err) {
      console.error("Error formatting date:", err);
    }

    return {
      id: n.id,
      icon: getNotificationIcon(n.tone),
      tone: n.tone,
      title: n.title,
      body: n.body,
      time: timeStr || "1m",
      createdAt: n.createdAt,
      ticketId: n.ticketId,
    };
  });

  const todayItems: typeof items = [];
  const yesterdayItems: typeof items = [];
  const earlierItems: typeof items = [];

  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  items.forEach((item) => {
    const itemDate = new Date(item.createdAt);
    const itemDateStr = itemDate.toDateString();

    if (itemDateStr === todayStr) {
      todayItems.push(item);
    } else if (itemDateStr === yesterdayStr) {
      yesterdayItems.push(item);
    } else {
      earlierItems.push(item);
    }
  });

  const groups: NotificationGroup[] = [];
  if (todayItems.length > 0) {
    groups.push({ title: "Today", items: todayItems });
  }
  if (yesterdayItems.length > 0) {
    groups.push({ title: "Yesterday", items: yesterdayItems });
  }
  if (earlierItems.length > 0) {
    groups.push({ title: "Earlier", items: earlierItems });
  }

  return groups;
}
