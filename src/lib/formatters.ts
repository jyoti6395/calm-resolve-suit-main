export interface DocumentSnapshot {
  id: string;
  data: () => Record<string, unknown>;
}

export interface QuerySnapshot {
  docs?: DocumentSnapshot[];
}

/**
 * FIREBASE SNAPSHOT DISPATCH SANITIZER
 * Ingests a raw Firestore collection snapshot array and safely parses each record.
 */
export function sanitizeQuerySnapshot<T>(snapshot?: QuerySnapshot | null): T[] {
  if (!snapshot || !snapshot.docs || !Array.isArray(snapshot.docs)) {
    return [];
  }

  return snapshot.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
    } as unknown as T;
  });
}

export interface FirebaseTimestamp {
  toDate: () => Date;
}

export type TimestampInput = FirebaseTimestamp | Date | string | number | null | undefined;

/**
 * TIMESTAMP FORMATTERS & LOCALIZATION (INTL API)
 * Formats a given timestamp into standard US layout: MM/DD/YYYY, hh:mm AM/PM
 */
export function formatUSDateTime(timestamp: TimestampInput): string {
  if (!timestamp) return "";

  let date: Date;

  if (
    typeof timestamp === "object" &&
    "toDate" in timestamp &&
    typeof timestamp.toDate === "function"
  ) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp as string | number);
  }

  if (isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Serializes a variable date property into a uniform, ISO-8601 string.
 */
export function serializeTimestamp(timestamp: TimestampInput): string {
  if (!timestamp) return "";

  let date: Date;

  if (
    typeof timestamp === "object" &&
    "toDate" in timestamp &&
    typeof timestamp.toDate === "function"
  ) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp as string | number);
  }

  if (isNaN(date.getTime())) return "";

  return date.toISOString();
}

/**
 * QUANTITATIVE & FINANCIAL UTILITIES
 * Coerces numeric inputs into localized US number strings with thousand-scale separators.
 */
export function formatUSNumber(value: number | string | undefined | null): string {
  if (value === null || value === undefined || value === "") return "0";

  const numericValue = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;

  if (isNaN(numericValue)) return "0";

  return new Intl.NumberFormat("en-US").format(numericValue);
}

/**
 * ACTIVE SLA TICK TICK-TOCK COUNTDOWN CALCULATOR
 * Calculates delta between now and target date, returning a countdown or breach status.
 */
export function formatSLAWithCountdown(dueDateIso: string): { text: string; isBreached: boolean } {
  if (!dueDateIso) {
    return { text: "No deadline", isBreached: false };
  }

  const targetDate = new Date(dueDateIso);
  const now = new Date();
  const deltaMs = targetDate.getTime() - now.getTime();

  if (isNaN(deltaMs)) {
    return { text: "Invalid Date", isBreached: true };
  }

  if (deltaMs <= 0) {
    return { text: "SLA Breached", isBreached: true };
  }

  const totalMinutes = Math.floor(deltaMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    text: `${hours}h ${minutes}m remaining`,
    isBreached: false,
  };
}
export function getStatusBadgeClass(status: string): string {
  const s = status?.toLowerCase() || "";
  if (s === "open") return "bg-primary/10 text-primary";
  if (s === "in_progress") return "bg-warning/15 text-warning";
  if (s === "resolved") return "bg-success/15 text-success";
  if (s === "closed") return "bg-muted text-muted-foreground";
  return "bg-secondary text-secondary-foreground";
}

export function getPriorityBadgeClass(priority: string): { bg: string; text: string; dot: string } {
  const p = priority?.toLowerCase() || "";
  if (p === "low")
    return { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" };
  if (p === "medium") return { bg: "bg-warning/15", text: "text-warning", dot: "bg-warning" };
  if (p === "high")
    return {
      bg: "bg-[oklch(0.7_0.18_45)/15%]",
      text: "text-[oklch(0.55_0.22_40)]",
      dot: "bg-[oklch(0.6_0.22_40)]",
    };
  if (p === "urgent" || p === "critical")
    return { bg: "bg-destructive/12", text: "text-destructive", dot: "bg-destructive" };
  return { bg: "bg-secondary", text: "text-secondary-foreground", dot: "bg-transparent" };
}
