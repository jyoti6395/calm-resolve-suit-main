import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { DesktopPageShell } from "@/components/layout/DesktopPageShell";
import { useHeaderSetup } from "@/components/layout/HeaderContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Camera,
  Image as ImageIcon,
  Paperclip,
  Sparkles,
  ChevronRight,
  Wifi,
  CreditCard,
  Laptop,
  Key,
  Terminal,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Tag,
  ClipboardList,
  Send,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector } from "@/store/hooks";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { toast } from "sonner";
import { serializeTimestamp } from "@/lib/formatters";
import { SLA_HOURS_MAP } from "@/constants/ticket";

const priorities = [
  {
    key: "low",
    label: "Low",
    hint: "Minor inconvenience",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-300",
    selectedBg: "bg-green-50",
  },
  {
    key: "medium",
    label: "Medium",
    hint: "Affects productivity",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-300",
    selectedBg: "bg-amber-50",
  },
  {
    key: "high",
    label: "High",
    hint: "Blocks work",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-300",
    selectedBg: "bg-orange-50",
  },
  {
    key: "critical",
    label: "Critical",
    hint: "Outage / data loss",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-300",
    selectedBg: "bg-red-50",
  },
] as const;

const createTicketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long").max(100),
  description: z.string().min(10, "Description must be at least 10 characters long").max(800),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["low", "medium", "high", "critical"]),
});

type CreateTicketInput = z.infer<typeof createTicketSchema>;

const newCategoriesList = [
  {
    title: "Technical Support",
    desc: "App issues, errors, bugs",
    icon: Terminal,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    selectedBg: "bg-purple-50",
    selectedBorder: "border-purple-400",
    categoryKey: "Software",
  },
  {
    title: "Account Access",
    desc: "Login, password, 2FA",
    icon: Key,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    selectedBg: "bg-emerald-50",
    selectedBorder: "border-emerald-400",
    categoryKey: "Access",
  },
  {
    title: "Connectivity",
    desc: "Internet, Wi-Fi, VPN",
    icon: Wifi,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    selectedBg: "bg-blue-50",
    selectedBorder: "border-blue-400",
    categoryKey: "Network",
  },
  {
    title: "Billing Support",
    desc: "Invoices, payments, refunds",
    icon: CreditCard,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    selectedBg: "bg-amber-50",
    selectedBorder: "border-amber-400",
    categoryKey: "Email",
  },
  {
    title: "Product Support",
    desc: "Features and how-tos",
    icon: Laptop,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    selectedBg: "bg-indigo-50",
    selectedBorder: "border-indigo-400",
    categoryKey: "Hardware",
  },
  {
    title: "General Enquiries",
    desc: "Other queries",
    icon: Sparkles,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    selectedBg: "bg-pink-50",
    selectedBorder: "border-pink-400",
    categoryKey: "Other",
  },
];

const STEPS = [
  { n: 1, label: "Category", sublabel: "Pick the topic", icon: Tag },
  { n: 2, label: "Details", sublabel: "Describe the issue", icon: ClipboardList },
  { n: 3, label: "Review", sublabel: "Confirm & submit", icon: Send },
];

export function NewTicketForm({ preselectedCategory }: { preselectedCategory?: string }) {
  const nav = useNavigate({ from: "/tickets/new" });
  const isMobile = useIsMobile();
  const [step, setStep] = useState(preselectedCategory ? 2 : 1);
  const user = useAppSelector((state) => state.auth.user);

  useHeaderSetup({ title: "Raise a ticket", back: true }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      category: preselectedCategory || "",
      priority: "medium",
    },
  });

  const watchCategory = watch("category");
  const watchTitle = watch("title");
  const watchDescription = watch("description");
  const watchPriority = watch("priority");

  const canNext =
    (step === 1 && !!watchCategory) ||
    (step === 2 && watchTitle.length >= 5 && watchDescription.length >= 10) ||
    step === 3;

  const onSubmit = async (data: CreateTicketInput) => {
    try {
      const now = new Date();
      const hoursToAdd = SLA_HOURS_MAP[data.priority] || 48;
      const slaDeadline = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
      const payload = {
        subject: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        ticketSequenceId: `TK-${now.getFullYear()}-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,
        createdBy: user?.uid || null,
        requesterId: user?.uid || null,
        requesterName: user?.displayName || "Unknown User",
        requesterEmail: user?.email || "user@example.com",
        department: "General",
        status: "open",
        createdAt: serializeTimestamp(now),
        updatedAt: serializeTimestamp(now),
        slaDeadline: serializeTimestamp(slaDeadline),
      };
      const docRef = await addDoc(collection(db, "tickets"), payload);
      const notificationPayload = {
        title: "Ticket raised",
        body: `Your ticket ${payload.ticketSequenceId} has been successfully raised.`,
        tone: "success" as const,
        createdAt: serializeTimestamp(now),
        userId: user?.uid || "",
        read: false,
      };
      try {
        await addDoc(collection(db, "notifications"), notificationPayload);
      } catch (err) {
        console.warn(
          "Failed to write to root notifications, trying subcollection fallback...",
          err,
        );
        try {
          if (user?.uid)
            await addDoc(collection(db, "users", user.uid, "notifications"), notificationPayload);
        } catch (subErr) {
          console.error("Failed to save ticket creation notification in both locations:", subErr);
        }
      }
      toast.success("Ticket created successfully");
      nav({
        to: "/tickets/confirmation",
        search: { ticketId: docRef.id, ticketSequenceId: payload.ticketSequenceId },
      });
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to create ticket. Please try again.");
    }
  };

  // ── STEP 1: Category ──────────────────────────────────────────────────────
  const step1Content = (
    <div className="animate-slide-up">
      <div className="grid grid-cols-2 gap-4">
        {newCategoriesList.map((c) => {
          const IconComponent = c.icon;
          const isSelected = watchCategory === c.categoryKey;
          return (
            <button
              key={c.categoryKey}
              type="button"
              onClick={() => setValue("category", c.categoryKey, { shouldValidate: true })}
              className={`rounded-2xl p-5 text-left border-2 transition-all flex flex-col gap-4 cursor-pointer ${
                isSelected
                  ? `${c.selectedBorder} ${c.selectedBg} shadow-sm`
                  : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
              }`}
            >
              <div
                className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${c.bg} ${c.color}`}
              >
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-800 leading-snug">{c.title}</p>
                <p className="mt-1 text-[12px] text-slate-400 leading-normal">{c.desc}</p>
              </div>
              {isSelected && (
                <div className="ml-auto mt-auto">
                  <CheckCircle2 className={`h-5 w-5 ${c.color}`} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── STEP 2: Details ───────────────────────────────────────────────────────
  const step2Content = (
    <div className="animate-slide-up space-y-6">
      <div>
        <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Title
        </label>
        <input
          {...register("title")}
          placeholder="e.g. VPN keeps disconnecting"
          maxLength={100}
          className="w-full h-12 px-4 rounded-xl bg-white border-2 border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[14px] font-semibold text-slate-900 placeholder:text-slate-400 transition-all hover:border-slate-300 shadow-sm"
        />
        <div className="flex justify-between text-[11px] text-slate-300 mt-1.5 px-1">
          <span>Minimum 5 characters</span>
          <span>{watchTitle?.length || 0} / 100</span>
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Description
        </label>
        <textarea
          {...register("description")}
          placeholder="What happened? What did you expect? Steps to reproduce…"
          rows={6}
          className="w-full p-4 rounded-xl bg-white border-2 border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 resize-none transition-all hover:border-slate-300 shadow-sm"
        />
        <div className="flex justify-between text-[11px] text-slate-300 mt-1.5 px-1">
          <span>Minimum 10 characters</span>
          <span>{watchDescription?.length || 0} / 800</span>
        </div>
      </div>


      <div>
        <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          Priority
        </label>
        <div className="grid grid-cols-4 gap-3">
          {priorities.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setValue("priority", p.key)}
              className={`rounded-xl p-3.5 text-left border-2 transition-all cursor-pointer ${
                watchPriority === p.key
                  ? `${p.border} ${p.selectedBg}`
                  : "border-slate-100 bg-white hover:border-slate-200"
              }`}
            >
              <p
                className={`text-[13px] font-extrabold ${watchPriority === p.key ? p.color : "text-slate-700"}`}
              >
                {p.label}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{p.hint}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          Attachments
        </label>
        <div className={`grid gap-3 ${isMobile ? "grid-cols-3" : "grid-cols-2"}`}>
          {(isMobile
            ? [
                { I: Camera, l: "Camera" },
                { I: ImageIcon, l: "Photo" },
                { I: Paperclip, l: "File" },
              ]
            : [
                { I: ImageIcon, l: "Upload Photo" },
                { I: Paperclip, l: "Upload File" },
              ]
          ).map(({ I, l }) => (
            <button
              key={l}
              type="button"
              className="h-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer group"
            >
              <I className="h-5 w-5 text-slate-400 group-hover:text-slate-500 transition-colors" />
              <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-500 transition-colors">
                {l}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── STEP 3: Review ────────────────────────────────────────────────────────
  const step3Content = (
    <div className="animate-slide-up space-y-5">
      <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
          <p className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
            Ticket Summary
          </p>
        </div>
        <div className="divide-y divide-slate-50 px-5">
          <Row
            k="Category"
            v={
              newCategoriesList.find((c) => c.categoryKey === getValues("category"))?.title ||
              getValues("category") ||
              ""
            }
          />
          <Row
            k="Priority"
            v={priorities.find((p) => p.key === getValues("priority"))?.label || ""}
          />
          <Row k="Title" v={getValues("title") || ""} />
          <Row
            k="Description"
            v={`${getValues("description")?.slice(0, 80) || ""}${getValues("description")?.length > 80 ? "…" : ""}`}
          />
          <Row k="Attachments" v="0 files" />
        </div>
      </div>

      <div className="rounded-xl bg-green-50 border border-green-100 p-5 flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-bold text-green-700 text-[14px]">
            Estimated response: under 30 minutes
          </p>
          <p className="mt-1 text-[12.5px] text-green-600/80">
            Your ticket will be auto-routed to the{" "}
            {newCategoriesList.find((c) => c.categoryKey === getValues("category"))?.title ||
              getValues("category")}{" "}
            team immediately after submission.
          </p>
        </div>
      </div>
    </div>
  );

  const stepContent = step === 1 ? step1Content : step === 2 ? step2Content : step3Content;

  // ── MOBILE ────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <MobileShell>
        <div className="min-h-screen bg-background flex flex-col">
          <div className="px-5">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${n <= step ? "bg-primary" : "bg-muted"}`}
                  />
                  <p
                    className={`mt-1.5 text-[10px] font-semibold ${n <= step ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    Step {n}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 px-5 mt-6 pb-32">
            <h2 className="text-[22px] font-extrabold tracking-tight mb-1">
              {step === 1
                ? "What's the issue about?"
                : step === 2
                  ? "Describe the problem"
                  : "Review & submit"}
            </h2>
            <p className="text-[13px] text-muted-foreground mb-5">
              {step === 1
                ? "Pick the category that fits best."
                : step === 2
                  ? "Be as specific as you can."
                  : "Confirm details before raising the ticket."}
            </p>
            {stepContent}
          </div>
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] p-5 bg-gradient-to-t from-background via-background to-transparent">
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="h-14 px-6 rounded-2xl bg-secondary font-semibold cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                disabled={!canNext || isSubmitting}
                onClick={() => (step === 3 ? handleSubmit(onSubmit)() : setStep(step + 1))}
                className="flex-1 h-14 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated disabled:opacity-40 cursor-pointer"
              >
                {step === 3 ? (isSubmitting ? "Submitting..." : "Submit ticket") : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </MobileShell>
    );
  }

  // ── DESKTOP: Two-panel split layout ───────────────────────────────────────
  const stepMeta = {
    1: { heading: "What's the issue about?", sub: "Pick the category that fits best." },
    2: {
      heading: "Describe the problem",
      sub: `${newCategoriesList.find((c) => c.categoryKey === watchCategory)?.title || "Issue"} · Be as specific as you can.`,
    },
    3: { heading: "Review & submit", sub: "Confirm details before raising the ticket." },
  }[step]!;

  return (
    <DesktopPageShell title="New Request" noPadding>
      <div className="flex gap-0 h-full min-h-[calc(100vh-64px)]">
        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <div className="w-[300px] shrink-0 bg-white border-r border-slate-100 flex flex-col px-8 py-10">
          {/* Back */}
          <button
            type="button"
            onClick={() => nav({ to: "/tickets" as never, search: { status: "all" } as never })}
            className="flex items-center gap-2 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors mb-10 cursor-pointer w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tickets
          </button>

          {/* Steps */}
          <div className="space-y-1">
            {STEPS.map(({ n, label, sublabel, icon: Icon }) => {
              const isActive = step === n;
              const isDone = step > n;
              return (
                <div key={n} className="relative">
                  {/* Connector line */}
                  {n < 3 && (
                    <div
                      className={`absolute left-[18px] top-[40px] w-px h-10 ${isDone || isActive ? "bg-blue-200" : "bg-slate-100"}`}
                    />
                  )}
                  <button
                    type="button"
                    disabled={n > step}
                    onClick={() => n <= step && setStep(n)}
                    className={`flex items-center gap-4 w-full rounded-xl px-3 py-3 transition-all ${isActive ? "bg-blue-50" : isDone ? "hover:bg-slate-50 cursor-pointer" : "cursor-default"}`}
                  >
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : isDone
                            ? "bg-green-100 text-green-600"
                            : "bg-slate-100 text-slate-300"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="text-left">
                      <p
                        className={`text-[13px] font-bold ${isActive ? "text-blue-700" : isDone ? "text-slate-700" : "text-slate-300"}`}
                      >
                        {label}
                      </p>
                      <p
                        className={`text-[11px] ${isActive ? "text-blue-500" : isDone ? "text-slate-400" : "text-slate-200"}`}
                      >
                        {sublabel}
                      </p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom info */}
          <div className="mt-auto pt-8 border-t border-slate-100">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-700">SLA Guaranteed</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  We respond to all critical tickets within 1 hour.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT CONTENT ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-[#f7f8fc] overflow-y-auto">
          {/* Content header */}
          <div className="px-10 pt-10 pb-6">
            <div className="flex items-center gap-3 mb-1">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-[12px] font-bold shrink-0">
                {step}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Step {step} of 3
              </span>
            </div>
            <h1 className="text-[26px] font-extrabold text-slate-800 tracking-tight">
              {stepMeta.heading}
            </h1>
            <p className="mt-1 text-[14px] text-slate-400 font-medium">{stepMeta.sub}</p>
          </div>

          {/* Form content */}
          <div className="flex-1 px-10 pb-10">{stepContent}</div>

          {/* Sticky footer actions */}
          <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-100 px-10 py-5">
            <div className="flex items-center justify-between max-w-[860px]">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-2 h-11 px-5 rounded-xl bg-white border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className={`h-1.5 rounded-full transition-all ${n <= step ? "bg-blue-500 w-6" : "bg-slate-200 w-3"}`}
                    />
                  ))}
                </div>
                <button
                  disabled={!canNext || isSubmitting}
                  onClick={() => (step === 3 ? handleSubmit(onSubmit)() : setStep(step + 1))}
                  className="flex items-center gap-2 h-11 px-7 rounded-xl bg-gradient-brand text-white text-[13px] font-bold shadow-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:shadow-none cursor-pointer"
                >
                  {step === 3 ? (isSubmitting ? "Submitting…" : "Submit ticket") : "Continue"}
                  {step < 3 && <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopPageShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-3.5 border-b border-slate-50 last:border-0">
      <span className="text-[12px] text-slate-400 font-semibold shrink-0">{k}</span>
      <span className="text-[13px] font-bold text-slate-800 text-right">{v}</span>
    </div>
  );
}
