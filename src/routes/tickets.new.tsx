import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { useHeaderSetup } from "@/components/HeaderContext";
import { categories } from "@/lib/mock";
import {
  Camera,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Sparkles,
  ChevronRight,
  Save,
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

export const Route = createFileRoute("/tickets/new")({ component: NewTicket });

const priorities = [
  { key: "low", label: "Low", hint: "Minor inconvenience" },
  { key: "medium", label: "Medium", hint: "Affects productivity" },
  { key: "high", label: "High", hint: "Blocks work" },
  { key: "critical", label: "Critical", hint: "Outage / data loss" },
] as const;

const createTicketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long").max(100),
  description: z.string().min(10, "Description must be at least 10 characters long").max(800),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["low", "medium", "high", "critical"]),
});

type CreateTicketInput = z.infer<typeof createTicketSchema>;

function NewTicket() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const user = useAppSelector((state) => state.auth.user);

  useHeaderSetup(
    {
      title: "Raise a ticket",
      back: true,
      right: (
        <button className="text-[12px] font-semibold text-primary flex items-center gap-1">
          <Save className="h-3.5 w-3.5" /> Draft
        </button>
      ),
    },
    [],
  );
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
      category: "",
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

      // Map 'title' to 'subject' to match the universal enterprise Ticket schema
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

      await addDoc(collection(db, "tickets"), payload);
      toast.success("Ticket created successfully");
      nav({ to: "/tickets/confirmation" });
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to create ticket. Please try again.");
    }
  };

  return (
    <MobileShell>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Stepper */}
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
          {step === 1 && (
            <div className="animate-slide-up">
              <h2 className="text-[22px] font-extrabold tracking-tight">What's the issue about?</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Pick a category — we'll tailor the form.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {categories.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setValue("category", c.key, { shouldValidate: true })}
                    className={`rounded-2xl p-4 text-left border-2 transition-all ${watchCategory === c.key ? "border-primary bg-primary/5 shadow-elevated" : "border-border bg-card"}`}
                  >
                    <div className="text-2xl">{c.icon}</div>
                    <p className="mt-2 text-[13px] font-semibold">{c.key}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-up">
              <h2 className="text-[22px] font-extrabold tracking-tight">Describe the problem</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {watchCategory} · Be as specific as you can.
              </p>

              <input
                {...register("title")}
                placeholder="Title (e.g. VPN keeps disconnecting)"
                className="mt-5 w-full h-14 px-4 rounded-2xl bg-secondary outline-none focus:bg-card focus:border-primary border-2 border-transparent text-[15px] font-semibold"
              />

              <textarea
                {...register("description")}
                placeholder="What happened? What did you expect? Steps to reproduce…"
                rows={5}
                className="mt-3 w-full p-4 rounded-2xl bg-secondary outline-none focus:bg-card focus:border-primary border-2 border-transparent text-[14px] resize-none"
              />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground px-1">
                <span>Min 10 characters</span>
                <span>{watchDescription?.length || 0} / 800</span>
              </div>

              {watchDescription?.length > 10 && (
                <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 animate-scale-in">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      AI suggestion
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] font-semibold">3 related KB articles found</p>
                  <div className="mt-3 space-y-2">
                    {[
                      "Reset VPN profile on macOS",
                      "Allowlist AnyConnect in firewall",
                      "Common Cisco AnyConnect issues",
                    ].map((s) => (
                      <button
                        key={s}
                        className="w-full flex items-center justify-between rounded-xl bg-card px-3 py-2 text-left text-[12.5px] font-medium"
                      >
                        {s}
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5">
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Priority
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setValue("priority", p.key)}
                      className={`rounded-2xl p-3 text-left border-2 transition-all ${watchPriority === p.key ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                    >
                      <p className="text-[13px] font-bold">{p.label}</p>
                      <p className="text-[10.5px] text-muted-foreground">{p.hint}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Attachments
                </p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {[
                    { I: Camera, l: "Camera" },
                    { I: ImageIcon, l: "Photo" },
                    { I: Paperclip, l: "File" },
                    { I: Mic, l: "Voice" },
                  ].map(({ I, l }) => (
                    <button
                      key={l}
                      className="aspect-square rounded-2xl bg-secondary flex flex-col items-center justify-center gap-1.5"
                    >
                      <I className="h-5 w-5 text-foreground/70" />
                      <span className="text-[10.5px] font-semibold">{l}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-up">
              <h2 className="text-[22px] font-extrabold tracking-tight">Review & submit</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Confirm details before raising the ticket.
              </p>

              <div className="mt-5 space-y-2 rounded-2xl bg-card border border-border p-4">
                <Row k="Category" v={getValues("category") || ""} />
                <Row
                  k="Priority"
                  v={priorities.find((p) => p.key === getValues("priority"))?.label || ""}
                />
                <Row
                  k="Description"
                  v={`${getValues("description")?.slice(0, 60) || ""}${getValues("description")?.length > 60 ? "…" : ""}`}
                />
                <Row k="Attachments" v="0 files" />
              </div>

              <div className="mt-5 rounded-2xl bg-success/10 border border-success/20 p-4 text-[12.5px] text-foreground/80">
                <p className="font-semibold text-success">Estimated response: under 30 minutes</p>
                <p className="mt-1 text-muted-foreground">
                  Your ticket will be auto-routed to the {getValues("category")} team.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] p-5 bg-gradient-to-t from-background via-background to-transparent">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="h-14 px-6 rounded-2xl bg-secondary font-semibold"
              >
                Back
              </button>
            )}
            <button
              disabled={!canNext || isSubmitting}
              onClick={() => (step === 3 ? handleSubmit(onSubmit)() : setStep(step + 1))}
              className="flex-1 h-14 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated disabled:opacity-40 disabled:shadow-none"
            >
              {step === 3 ? (isSubmitting ? "Submitting..." : "Submit ticket") : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 py-2 border-b border-border last:border-0 last:pb-0 first:pt-0">
      <span className="text-[12px] text-muted-foreground">{k}</span>
      <span className="text-[13px] font-semibold text-right">{v}</span>
    </div>
  );
}
