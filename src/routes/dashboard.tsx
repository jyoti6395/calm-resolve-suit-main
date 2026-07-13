import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { DesktopPageShell } from "@/components/layout/DesktopPageShell";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Plus,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  Lock,
  FileText,
  Wifi,
  ClipboardList,
  Laptop,
  Key,
  Terminal,
  Sparkles,
  Server,
  Shield,
  Search,
  FileWarning,
  ChevronRight,
  ListFilter,
  Loader2,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import {
  getStatusBadgeClass,
  getPriorityBadgeClass,
  formatUSDateTime,
  formatSLAWithCountdown,
} from "@/lib/formatters";
import type { Ticket, Department } from "@/types/store";
import { getUserRoles } from "@/lib/utils";
import { getDepartments } from "@/services/departmentService";
import {
  getDepartmentStyle,
  fallbackDepartments,
} from "@/features/tickets/components/NewTicketForm";

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
}

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import { CategoryGrid } from "@/features/dashboard/components/CategoryGrid";
import { RecentTicketsList } from "@/features/dashboard/components/RecentTicketsList";

function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const { isTechnician, isCustomer } = getUserRoles(user?.role);
  const { technicians: dbTechnicians } = useAppSelector((state) => state.technicians);
  const dbTickets = useAppSelector((state) => state.tickets.tickets) as Ticket[];
  const notificationItems = useAppSelector((state) => state.notifications.notifications);
  const navigate = useNavigate({ from: "/dashboard" });
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchDepts() {
      try {
        const list = await getDepartments();
        if (active) {
          if (list && list.length > 0) {
            setDepartments(list);
          } else {
            console.log("Departments list is empty, falling back to predefined defaults");
            setDepartments(fallbackDepartments);
          }
        }
      } catch (err) {
        console.error("Failed to load departments dynamically:", err);
        if (active) {
          setDepartments(fallbackDepartments);
        }
      } finally {
        if (active) {
          setLoadingDepts(false);
        }
      }
    }
    fetchDepts();
    return () => {
      active = false;
    };
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 22) return "Good evening";
    return "Good night";
  }, []);

  const dashboardTickets = useMemo(() => {
    if (isTechnician && user?.uid) {
      return dbTickets.filter((t) => t.assignedToId === user.uid);
    }
    return dbTickets;
  }, [dbTickets, isTechnician, user]);

  const openCount = useMemo(() => {
    return dashboardTickets.filter((t) => t.status?.toLowerCase() === "open").length;
  }, [dashboardTickets]);

  const in_progressCount = useMemo(() => {
    return dashboardTickets.filter((t) => {
      const s = t.status?.toLowerCase();
      return s === "pending" || s === "in_progress";
    }).length;
  }, [dashboardTickets]);

  const resolvedCount = useMemo(() => {
    return dashboardTickets.filter((t) => t.status?.toLowerCase() === "resolved").length;
  }, [dashboardTickets]);

  const closedCount = useMemo(() => {
    return dashboardTickets.filter((t) => t.status?.toLowerCase() === "closed").length;
  }, [dashboardTickets]);

  const summary = useMemo(
    () => [
      {
        key: "open",
        label: "OPEN TICKETS",
        value: openCount,
        icon: FileWarning,
        color: "text-red-500",
        bg: "bg-red-50",
        trend: "+12%",
        trendColor: "bg-red-100 text-red-600",
        foldColor: "bg-red-50",
        statusFilter: "open",
      },
      {
        key: "in_progress",
        label: "IN PROGRESS",
        value: in_progressCount,
        icon: Clock,
        color: "text-blue-500",
        bg: "bg-blue-50",
        trend: "-5%",
        trendColor: "bg-blue-100 text-blue-600",
        foldColor: "bg-blue-50",
        statusFilter: "in_progress",
      },
      {
        key: "resolved",
        label: "RESOLVED TODAY",
        value: resolvedCount,
        icon: CheckCircle2,
        color: "text-green-500",
        bg: "bg-green-50",
        trend: "+24%",
        trendColor: "bg-green-100 text-green-600",
        foldColor: "bg-green-50",
        statusFilter: "resolved",
      },
      {
        key: "avg_response",
        label: "AVG RESPONSE",
        value: "14m",
        icon: Clock,
        color: "text-slate-500",
        bg: "bg-slate-100",
        trend: "+2m",
        trendColor: "bg-orange-100 text-orange-600",
        foldColor: "bg-slate-100",
        statusFilter: "all",
      },
    ],
    [openCount, in_progressCount, resolvedCount],
  );

  const recentTickets = useMemo(() => {
    return [...dashboardTickets]
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 5);
  }, [dashboardTickets]);

  const filteredRecentTickets = useMemo(() => {
    if (!searchQuery) return recentTickets;
    const query = searchQuery.toLowerCase();
    return dashboardTickets
      .filter((t) => {
        const title = (t as Ticket & { title?: string }).title || t.subject || "";
        const seqId = t.ticketSequenceId || t.id || "";
        const assignedName = t.assignedToName || "";
        const category = t.category || "";
        return (
          title.toLowerCase().includes(query) ||
          seqId.toLowerCase().includes(query) ||
          assignedName.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 5);
  }, [dashboardTickets, recentTickets, searchQuery]);

  const atRiskTickets = useMemo(() => {
    return dashboardTickets
      .filter((t) => {
        if (t.status === "resolved" || t.status === "closed") return false;
        if (!t.slaDeadline) return false;
        const { isBreached } = formatSLAWithCountdown(t.slaDeadline);
        return !isBreached;
      })
      .sort((a, b) => new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime());
  }, [dashboardTickets]);

  const atRiskCount = atRiskTickets.length;
  const atRiskTicket = atRiskTickets[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({
        to: "/tickets",
        search: { search: searchQuery.trim(), status: "all" },
      });
    }
  };

  const displayTechnicians = dbTechnicians
    .filter((t) => t.online)
    .map((t) => {
      const activeLoad = dbTickets.filter(
        (ticket) =>
          ticket.assignedToId === t.uid &&
          ticket.status !== "resolved" &&
          ticket.status !== "closed",
      ).length;
      return {
        ...t,
        load: activeLoad,
      };
    });

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
    return "AP";
  };

  if (!isMobile) {
    return (
      <div className="flex flex-col h-full w-full px-8 py-8 pb-10 bg-[#f5f6fa] min-h-screen">
        <div className="w-full max-w-[1440px] mx-auto">
          {/* ── ZONE 1: Header ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[28px] font-extrabold text-slate-800 tracking-tight leading-tight">
                {greeting}, {user?.displayName?.split(" ")[0] || "there"} 👋
              </h1>
              <p className="mt-1 text-[14px] text-slate-500 font-medium">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                &nbsp;·&nbsp;Here&apos;s your support overview.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/tickets"
                search={{ status: "all" }}
                className="flex items-center gap-2 h-10 px-4 rounded-xl text-[13px] font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
                <FileText className="h-4 w-4" />
                All Tickets
              </Link>
              <Link
                to="/tickets/new"
                className="flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-bold bg-gradient-brand text-white hover:opacity-90 shadow-sm transition-all"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                New Request
              </Link>
            </div>
          </div>

          {/* ── ZONE 2: KPI Cards ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
            {summary.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  to="/tickets"
                  search={{
                    status: s.statusFilter as
                      | "open"
                      | "in_progress"
                      | "resolved"
                      | "closed"
                      | "all",
                  }}
                  key={s.key}
                  className="group relative overflow-hidden rounded-[1.5rem] bg-white border border-slate-100 p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all flex flex-col justify-between"
                >
                  {/* Corner Fold */}
                  <div className="absolute top-0 right-0 h-[5rem] w-[5rem] overflow-hidden rounded-tr-[1.5rem]">
                    <div
                      className={`absolute -top-[3.5rem] -right-[3.5rem] w-[7rem] h-[7rem] rotate-45 ${s.foldColor}`}
                    />
                  </div>
                  {/* Trend Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span
                      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${s.trendColor}`}
                    >
                      {s.trend}
                    </span>
                  </div>
                  <div className="relative z-10">
                    <div
                      className={`h-11 w-11 rounded-2xl ${s.bg} flex items-center justify-center mb-4 shadow-sm`}
                    >
                      <Icon className={`h-5 w-5 ${s.color}`} strokeWidth={2.5} />
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                      {s.label}
                    </p>
                    <p className="text-[40px] font-extrabold text-slate-800 leading-none tracking-tighter">
                      {s.value}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── ZONE 3: Main Content + Sidebar ─────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
            {/* LEFT: Main Content */}
            <div className="space-y-6">
              {/* Recent Tickets Table */}
              <div className="rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
                  <div>
                    <h2 className="text-[17px] font-bold text-slate-800 tracking-tight">
                      Recent Tickets
                    </h2>
                    <p className="text-[12px] text-slate-400 mt-0.5 font-medium">
                      Latest activity across your support queue
                    </p>
                  </div>
                  <Link
                    to="/tickets"
                    search={{ status: "all" }}
                    className="flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    View All <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-slate-50 bg-slate-50/50">
                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Ticket ID
                        </th>
                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Subject
                        </th>
                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Priority
                        </th>
                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Status
                        </th>
                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">
                          Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredRecentTickets.slice(0, 7).map((t) => (
                        <tr
                          key={t.id}
                          onClick={() => navigate({ to: "/tickets/$id", params: { id: t.id } })}
                          className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <span className="text-[13px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors font-mono">
                              {t.ticketSequenceId || t.id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-[240px]">
                            <p className="text-[13px] text-slate-700 font-semibold truncate">
                              {(t as Ticket & { title?: string }).title || t.subject}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                              {t.requesterName || t.requesterEmail || "Unknown"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold capitalize border ${
                                t.priority === "critical"
                                  ? "bg-red-50 border-red-200 text-red-600"
                                  : t.priority === "high"
                                    ? "bg-orange-50 border-orange-200 text-orange-600"
                                    : t.priority === "medium"
                                      ? "bg-amber-50 border-amber-200 text-amber-600"
                                      : "bg-slate-50 border-slate-200 text-slate-600"
                              }`}
                            >
                              {t.priority || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${
                                t.status === "open"
                                  ? "bg-red-50 border-red-200 text-red-600"
                                  : t.status === "in_progress"
                                    ? "bg-blue-50 border-blue-200 text-blue-600"
                                    : t.status === "resolved"
                                      ? "bg-green-50 border-green-200 text-green-600"
                                      : "bg-slate-50 border-slate-200 text-slate-500"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  t.status === "open"
                                    ? "bg-red-500"
                                    : t.status === "in_progress"
                                      ? "bg-blue-500"
                                      : t.status === "resolved"
                                        ? "bg-green-500"
                                        : "bg-slate-400"
                                }`}
                              />
                              {t.status?.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-[12px] text-slate-400 font-medium">
                            {getRelativeTime(t.updatedAt || t.createdAt)}
                          </td>
                        </tr>
                      ))}
                      {filteredRecentTickets.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-14 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-slate-400" />
                              </div>
                              <p className="text-[14px] text-slate-500 font-semibold">
                                No tickets yet
                              </p>
                              <p className="text-[12px] text-slate-400">
                                Create your first request to get started.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Activity Timeline */}
              {filteredRecentTickets.length > 0 && (
                <div className="rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] p-6">
                  <h2 className="text-[17px] font-bold text-slate-800 tracking-tight mb-5">
                    Activity Timeline
                  </h2>
                  <div className="relative">
                    <div className="absolute left-[18px] top-0 bottom-0 w-px bg-slate-100" />
                    <div className="space-y-5">
                      {filteredRecentTickets.slice(0, 4).map((t) => (
                        <div
                          key={`activity-${t.id}`}
                          className="flex items-start gap-4 pl-1 cursor-pointer group"
                          onClick={() => navigate({ to: "/tickets/$id", params: { id: t.id } })}
                        >
                          <div
                            className={`h-9 w-9 rounded-full shrink-0 flex items-center justify-center z-10 border-2 border-white shadow-sm ${
                              t.status === "open"
                                ? "bg-red-100"
                                : t.status === "in_progress"
                                  ? "bg-blue-100"
                                  : t.status === "resolved"
                                    ? "bg-green-100"
                                    : "bg-slate-100"
                            }`}
                          >
                            {t.status === "resolved" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : t.status === "in_progress" ? (
                              <Clock className="h-4 w-4 text-blue-600" />
                            ) : (
                              <FileWarning className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-[13px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                              {(t as Ticket & { title?: string }).title || t.subject}
                            </p>
                            <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                              <span className="font-mono text-slate-500">
                                {t.ticketSequenceId || t.id.slice(0, 8)}
                              </span>
                              &nbsp;·&nbsp;Status:{" "}
                              <span className="capitalize font-semibold text-slate-600">
                                {t.status?.replace("_", " ")}
                              </span>
                              &nbsp;·&nbsp;{getRelativeTime(t.updatedAt || t.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Sidebar */}
            <div className="space-y-5 sticky top-6">
              {/* Quick Create Card */}
              {/* <div className="rounded-[1.5rem] bg-gradient-hero text-white p-6 shadow-lg relative overflow-hidden">
                <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[15px] font-extrabold text-white leading-tight">
                        Need help?
                      </p>
                      <p className="text-[12px] text-white/70 font-medium">
                        We&apos;ll route it instantly
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/tickets/new"
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-white text-blue-700 font-bold text-[14px] hover:bg-white/90 transition-all shadow-sm"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    Create New Request
                  </Link>
                </div>
              </div> */}

              {/* Notification Feed */}
              <div className="rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[15px] font-bold text-slate-800">Notifications</h2>
                  <Link
                    to="/notifications"
                    className="text-[12px] font-bold text-blue-600 hover:text-blue-700"
                  >
                    View all
                  </Link>
                </div>
                {notificationItems.length > 0 ? (
                  <div className="space-y-4">
                    {notificationItems.slice(0, 4).map((n) => (
                      <div key={n.id} className="flex items-start gap-3">
                        <div
                          className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center ${
                            n.tone === "success"
                              ? "bg-green-100"
                              : n.tone === "destructive"
                                ? "bg-red-100"
                                : n.tone === "warning"
                                  ? "bg-amber-100"
                                  : "bg-blue-100"
                          }`}
                        >
                          {n.tone === "success" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : n.tone === "destructive" ? (
                            <Bell className="h-4 w-4 text-red-600" />
                          ) : n.tone === "warning" ? (
                            <Clock className="h-4 w-4 text-amber-600" />
                          ) : (
                            <Bell className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-slate-800 leading-snug truncate">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-2">
                            {n.body}
                          </p>
                          <p className="text-[10px] text-slate-300 font-medium mt-1">
                            {getRelativeTime(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                    <p className="text-[13px] font-semibold text-slate-500">All caught up!</p>
                  </div>
                )}
              </div>

              {/* Category Quick Links */}
              <div className="rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] p-6">
                <h2 className="text-[15px] font-bold text-slate-800 mb-4">Browse by topic</h2>
                {loadingDepts ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {departments.map((dept) => {
                      const style = getDepartmentStyle(dept.categoryKey || dept.id, dept.name);
                      const Icon = style.icon;
                      return (
                        <Link
                          key={dept.id}
                          to="/tickets/new"
                          search={{ category: dept.id }}
                          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group animate-fade-in"
                        >
                          <div
                            className={`h-8 w-8 rounded-lg ${style.bg} flex items-center justify-center shrink-0`}
                          >
                            <Icon className={`h-4 w-4 ${style.color}`} />
                          </div>
                          <span className="text-[12px] font-bold text-slate-700 group-hover:text-slate-900 truncate">
                            {dept.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Technicians Online (technician only) */}
              {isTechnician && displayTechnicians.length > 0 && (
                <div className="rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] p-6">
                  <h2 className="text-[15px] font-bold text-slate-800 mb-4">Technicians Online</h2>
                  <div className="space-y-3">
                    {displayTechnicians.map((t) => (
                      <div key={t.uid} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-[12px]">
                              {t.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white" />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-slate-800">{t.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {t.role || "Technician"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[14px] font-extrabold text-blue-600">{t.load}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Active
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MobileShell>
      <div className="min-h-screen bg-background pb-8">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-[oklch(0.22_0.12_263)] backdrop-blur-md px-5 pt-[env(safe-area-inset-top,0px)] text-white">
          <div className="relative flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center font-bold">
                {getInitials()}
              </div>
              <div>
                <p className="text-[11px] text-white/60 uppercase tracking-wider">{greeting}</p>
                <p className="text-[15px] font-semibold">{user?.displayName || "Guest"}</p>
              </div>
            </div>
            <Link
              to="/notifications"
              className="relative h-11 w-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-[oklch(0.18_0.12_263)]" />
            </Link>
          </div>
        </div>

        {/* Hero with Rounded Bottom Corners */}
        <div className="relative px-5 pb-8 bg-gradient-hero text-white rounded-b-[2.5rem] overflow-hidden">
          <div className="absolute inset-0 opacity-50" />

          {isTechnician ? (
            /* Technician Hero View */
            <div className="relative z-10 flex flex-col pt-2 pb-1">
              {/* Search input capsule */}
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative flex items-center h-12 w-full rounded-full bg-gradient-to-r from-[#0d46c5] to-[#07329b] border border-white/10 hover:brightness-105 focus-within:brightness-105 transition-all px-4">
                  <Search className="h-4.5 w-4.5 text-white/80 shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tickets, IDs, technicians..."
                    className="flex-1 bg-transparent border-none outline-none text-[14px] text-white placeholder:text-white/70 w-full animate-fade-in"
                  />
                </div>
              </form>

              {/* SLA at risk card */}
              {atRiskTicket ? (
                <Link
                  to="/tickets/$id"
                  params={{ id: atRiskTicket.id }}
                  className="w-full mt-4 flex items-center justify-between rounded-full bg-white/5 backdrop-blur-md border border-white/10 py-3.5 px-5 hover:bg-white/10 transition-all active:scale-[0.99] animate-slide-up"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-9 w-9 rounded-full bg-[#511c27] flex items-center justify-center shrink-0 text-white">
                      <FileWarning className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-white tracking-tight leading-normal">
                        {atRiskCount} SLA{atRiskCount > 1 ? "s" : ""} at risk
                      </p>
                      <p className="text-[11px] text-white/60 truncate font-semibold mt-0.5 leading-normal">
                        {atRiskTicket.ticketSequenceId || atRiskTicket.id.slice(0, 10)} •{" "}
                        {(atRiskTicket as Ticket & { title?: string }).title ||
                          atRiskTicket.subject}{" "}
                        — {formatSLAWithCountdown(atRiskTicket.slaDeadline).text}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4.5 w-4.5 text-white/50 shrink-0 ml-2" />
                </Link>
              ) : (
                <div className="w-full mt-4 flex items-center justify-between rounded-full bg-white/5 backdrop-blur-md border border-white/10 py-3.5 px-5 animate-slide-up">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-9 w-9 rounded-full bg-[#143d28] flex items-center justify-center shrink-0 text-white">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-white tracking-tight leading-normal">
                        All SLAs on track
                      </p>
                      <p className="text-[11px] text-white/60 truncate font-semibold mt-0.5 leading-normal">
                        Excellent! No tickets require immediate attention.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Customer Hero View */
            <>
              {/* Hero Content */}
              <div className="relative z-10 mt-6">
                <h1 className="text-[28px] font-bold  leading-tight tracking-tight text-white">
                  How can we help today?
                </h1>
                <p className="mt-2 text-[13px] font-semibold  text-white/70 leading-relaxed mx-auto">
                  Submit requests, track progress, and stay connected with our support team.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 flex items-center gap-3 mt-7 w-full">
                <Link
                  to="/tickets/new"
                  className="flex-[2.3] h-12 px-6 rounded-full bg-white hover:bg-white/95 text-primary font-semibold text-[14px] flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  Create request
                </Link>
                <Link
                  to="/tickets"
                  search={{ status: "all" }}
                  className="flex-1 h-12 px-6 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-[14px] flex items-center justify-center transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  Track request
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Summary cards */}
        <SummaryCards summary={summary} />

        {/* How can we help? Section */}
        <CategoryGrid departments={departments} loading={loadingDepts} />

        {/* Recent tickets */}
        <RecentTicketsList tickets={filteredRecentTickets} />
      </div>

      {isCustomer && (
        <Link
          to="/tickets/new"
          className="fixed z-50 bottom-24 right-5 h-14 px-5 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated hover:shadow-glow flex items-center gap-2 transition-all"
          style={{ left: "min(calc(50% + 220px - 160px), calc(100% - 160px))" }}
        >
          <Plus className="h-5 w-5" /> Raise
        </Link>
      )}
    </MobileShell>
  );
}
