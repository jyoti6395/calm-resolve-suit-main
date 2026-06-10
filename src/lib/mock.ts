export type TicketStatus = "open" | "pending" | "resolved" | "escalated";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export type Ticket = {
  id: string;
  title: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: { name: string; initials: string; online: boolean };
  updated: string;
  slaHours: number;
  description: string;
};

export const tickets: Ticket[] = [
  {
    id: "AT-2841",
    title: "VPN keeps disconnecting on Mac",
    category: "Network",
    status: "open",
    priority: "high",
    assignee: { name: "Priya N.", initials: "PN", online: true },
    updated: "2m ago",
    slaHours: 3,
    description: "Cisco AnyConnect drops every ~10 minutes. Reinstalled, no change.",
  },
  {
    id: "AT-2839",
    title: "Outlook calendar not syncing",
    category: "Email",
    status: "pending",
    priority: "medium",
    assignee: { name: "Marco D.", initials: "MD", online: true },
    updated: "18m ago",
    slaHours: 12,
    description: "Shared calendar invites not appearing on mobile.",
  },
  {
    id: "AT-2835",
    title: "Production DB latency spike",
    category: "Infrastructure",
    status: "escalated",
    priority: "critical",
    assignee: { name: "Lena O.", initials: "LO", online: true },
    updated: "32m ago",
    slaHours: 1,
    description: "p95 jumped from 80ms to 1.2s starting 14:20 UTC.",
  },
  {
    id: "AT-2828",
    title: "Printer offline — floor 4",
    category: "Hardware",
    status: "resolved",
    priority: "low",
    assignee: { name: "Sam K.", initials: "SK", online: false },
    updated: "1h ago",
    slaHours: 24,
    description: "Replaced toner and restarted print server.",
  },
  {
    id: "AT-2820",
    title: "MFA reset for new hire",
    category: "Access",
    status: "open",
    priority: "medium",
    assignee: { name: "Aria B.", initials: "AB", online: true },
    updated: "2h ago",
    slaHours: 8,
    description: "Provision Okta + Duo for J. Patel starting Monday.",
  },
  {
    id: "AT-2814",
    title: "Slack workspace audit logs",
    category: "Compliance",
    status: "resolved",
    priority: "low",
    assignee: { name: "Tomás R.", initials: "TR", online: false },
    updated: "yesterday",
    slaHours: 48,
    description: "Exported 90-day audit logs for SOC 2.",
  },
];

export const categories = [
  { key: "Network", icon: "🌐" },
  { key: "Email", icon: "✉️" },
  { key: "Hardware", icon: "🖥️" },
  { key: "Access", icon: "🔑" },
  { key: "Software", icon: "💿" },
  { key: "Infrastructure", icon: "⚙️" },
  { key: "Security", icon: "🛡️" },
  { key: "Other", icon: "✨" },
];

export const technicians = [
  { name: "Priya Nair", initials: "PN", role: "Network Lead", online: true, load: 4 },
  { name: "Marco Diaz", initials: "MD", role: "Email & Collab", online: true, load: 2 },
  { name: "Lena Okafor", initials: "LO", role: "Infra SRE", online: true, load: 6 },
  { name: "Sam Kim", initials: "SK", role: "Hardware", online: false, load: 1 },
];

export const priorityStyles: Record<
  TicketPriority,
  { bg: string; text: string; dot: string; label: string }
> = {
  low: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground", label: "Low" },
  medium: { bg: "bg-warning/15", text: "text-warning", dot: "bg-warning", label: "Medium" },
  high: {
    bg: "bg-[oklch(0.7_0.18_45)/15%]",
    text: "text-[oklch(0.55_0.22_40)]",
    dot: "bg-[oklch(0.6_0.22_40)]",
    label: "High",
  },
  critical: {
    bg: "bg-destructive/12",
    text: "text-destructive",
    dot: "bg-destructive",
    label: "Critical",
  },
};

export const statusStyles: Record<TicketStatus, { bg: string; text: string; label: string }> = {
  open: { bg: "bg-primary/10", text: "text-primary", label: "Open" },
  pending: { bg: "bg-warning/15", text: "text-warning", label: "Pending" },
  resolved: { bg: "bg-success/15", text: "text-success", label: "Resolved" },
  escalated: { bg: "bg-destructive/12", text: "text-destructive", label: "Escalated" },
};
