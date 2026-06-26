import { useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
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
  X,
  Loader2,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector } from "@/store/hooks";
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from "@/firebase/firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from "firebase/storage";
import { toast } from "sonner";
import { serializeTimestamp } from "@/lib/formatters";
import { SLA_HOURS_MAP } from "@/constants/ticket";
import { Progress } from "@/components/ui/progress";

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
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .min(5, "Title must be at least 5 characters long")
    .regex(/^[a-zA-Z0-9\s\-_.,?!():@'/#[\]]+$/, "Title contains invalid characters")
    .max(100),
  description: z
    .string()
    .trim()
    .min(1, "Description cannot be empty")
    .min(10, "Description must be at least 10 characters long")
    .regex(
      /^[a-zA-Z0-9\s\-_.,?!():@'/#[\]{}"&%*+=;<>~^|\\$]+$/,
      "Description contains invalid characters",
    )
    .max(800, "Description cannot exceed 800 characters"),
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
    title: "Service Request",
    desc: "Request services or assistance",
    icon: ClipboardList,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    selectedBg: "bg-amber-50",
    selectedBorder: "border-amber-400",
    categoryKey: "Service",
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

interface AttachmentItem {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "success" | "error";
  url?: string;
  type: "photo" | "document";
  uploadTask?: UploadTask;
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function NewTicketForm({ preselectedCategory }: { preselectedCategory?: string }) {
  const nav = useNavigate({ from: "/tickets/new" });
  const isMobile = useIsMobile();
  const [step, setStep] = useState(preselectedCategory ? 2 : 1);
  const user = useAppSelector((state) => state.auth.user);

  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useHeaderSetup({ title: "Raise a ticket", back: true }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { isSubmitting, errors },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    mode: "onChange",
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

  const isUploading = attachments.some((a) => a.status === "uploading");
  const trimmedTitle = watchTitle?.trim() || "";
  const trimmedDescription = watchDescription?.trim() || "";
  const canNext =
    ((step === 1 && !!watchCategory) ||
      (step === 2 &&
        trimmedTitle.length >= 5 &&
        trimmedDescription.length >= 10 &&
        !errors.title &&
        !errors.description) ||
      step === 3) &&
    !isUploading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "photo" | "document") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds the 10MB size limit.`);
        return;
      }

      const id = Math.random().toString(36).substring(2, 9) + "_" + Date.now();

      const newAttachment: AttachmentItem = {
        id,
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: "uploading",
        type,
      };

      setAttachments((prev) => [...prev, newAttachment]);

      if (!user) {
        toast.error("You must be logged in to upload files.");
        return;
      }

      const storageRef = ref(storage, `tickets/attachments/${user.uid}/${id}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setAttachments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, uploadTask } : item)),
      );

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setAttachments((prev) =>
            prev.map((item) => (item.id === id ? { ...item, progress } : item)),
          );
        },
        (error) => {
          console.error("Upload error:", error);
          toast.error(`Failed to upload ${file.name}`);
          setAttachments((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: "error", progress: 0 } : item)),
          );
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setAttachments((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, status: "success", url: downloadURL } : item,
            ),
          );
        },
      );
    });

    e.target.value = "";
  };

  const handleRemoveAttachment = async (id: string) => {
    const item = attachments.find((a) => a.id === id);
    if (!item) return;

    if (item.status === "uploading" && item.uploadTask) {
      item.uploadTask.cancel();
    }

    if (item.status === "success" && item.url) {
      try {
        if (!user) return;
        const storageRef = ref(storage, `tickets/attachments/${user.uid}/${id}/${item.name}`);
        await deleteObject(storageRef);
      } catch (err) {
        console.error("Failed to delete file from storage:", err);
      }
    }

    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

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
        attachments: attachments
          .filter((a) => a.status === "success" && a.url)
          .map((a) => ({
            name: a.name,
            url: a.url!,
            type: a.type,
            size: a.size,
          })),
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
          Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register("title")}
          placeholder="e.g. VPN keeps disconnecting"
          maxLength={100}
          className="w-full h-12 px-4 rounded-xl bg-white border-2 border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[14px] font-semibold text-slate-900 placeholder:text-slate-400 transition-all hover:border-slate-300 shadow-sm"
        />
        <div className="flex justify-between text-[11px] mt-1.5 px-1">
          {errors.title ? (
            <span className="text-red-500 font-semibold">{errors.title.message}</span>
          ) : (
            <span className="text-slate-300">Minimum 5 characters</span>
          )}
          <span className="text-slate-300">{watchTitle?.length || 0} / 100</span>
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("description")}
          placeholder="What happened? What did you expect? Steps to reproduce…"
          rows={6}
          maxLength={800}
          className="w-full p-4 rounded-xl bg-white border-2 border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 resize-none transition-all hover:border-slate-300 shadow-sm"
        />
        <div className="flex justify-between text-[11px] mt-1.5 px-1">
          {errors.description ? (
            <span className="text-red-500 font-semibold">{errors.description.message}</span>
          ) : watchDescription?.length >= 800 ? (
            <span className="text-red-500 font-semibold">
              Description cannot exceed 800 characters
            </span>
          ) : (
            <span className="text-slate-300">Minimum 10 characters</span>
          )}
          <span
            className={`transition-colors ${watchDescription?.length >= 800 ? "text-red-500 font-semibold" : "text-slate-300"}`}
          >
            {watchDescription?.length || 0} / 800
          </span>
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
          Attachments{" "}
          {isUploading && (
            <span className="text-blue-500 lowercase font-medium animate-pulse">
              (uploading files...)
            </span>
          )}
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
              onClick={() => {
                if (l === "Camera") cameraInputRef.current?.click();
                else if (l === "Photo" || l === "Upload Photo") imageInputRef.current?.click();
                else if (l === "File" || l === "Upload File") fileInputRef.current?.click();
              }}
              className="h-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer group"
            >
              <I className="h-5 w-5 text-slate-400 group-hover:text-slate-500 transition-colors" />
              <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-500 transition-colors">
                {l}
              </span>
            </button>
          ))}
        </div>

        {/* Hidden Inputs */}
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFileChange(e, "photo")}
        />
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, "photo")}
          multiple
        />
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          className="hidden"
          onChange={(e) => handleFileChange(e, "document")}
          multiple
        />

        {/* Attachment Item Progress / Complete List */}
        {attachments.length > 0 && (
          <div className="mt-4 space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {attachments.map((item) => {
              const FileIcon = item.type === "photo" ? ImageIcon : FileText;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-150 shadow-sm animate-scale-in"
                >
                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <FileIcon className="h-4.5 w-4.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-700 truncate leading-snug">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium">
                      <span>{formatFileSize(item.size)}</span>
                      <span className="text-slate-300">•</span>
                      {item.status === "uploading" && (
                        <span className="text-blue-500 font-semibold">Uploading</span>
                      )}
                      {item.status === "success" && (
                        <span className="text-emerald-500 font-semibold">Ready</span>
                      )}
                      {item.status === "error" && (
                        <span className="text-red-500 font-semibold">Failed</span>
                      )}
                    </div>
                    {item.status === "uploading" && (
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={item.progress} className="h-1.5 bg-blue-100/50" />
                        <span className="text-[10px] font-bold text-blue-600 shrink-0 min-w-[28px] text-right">
                          {item.progress}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {item.status === "uploading" && (
                      <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(item.id)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
          <Row
            k="Attachments"
            v={`${attachments.filter((a) => a.status === "success").length} file(s)`}
          />
        </div>

        {/* Attachments list for review */}
        {attachments.filter((a) => a.status === "success").length > 0 && (
          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-0.5">
              Attached Files ({attachments.filter((a) => a.status === "success").length})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {attachments
                .filter((a) => a.status === "success")
                .map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100 text-[12px] min-w-0"
                  >
                    {a.type === "photo" ? (
                      <ImageIcon className="h-4 w-4 text-slate-400 shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    <span className="font-bold text-slate-700 truncate">{a.name}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
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
    1: {
      heading: "What do you need help with?",
      sub: "Select the category that best matches your request.",
    },
    2: {
      heading: "Tell us more",
      sub: `${newCategoriesList.find((c) => c.categoryKey === watchCategory)?.title || "Issue"} · Provide the details below.`,
    },
    3: { heading: "Review & submit", sub: "Confirm details before raising the ticket." },
  }[step]!;

  return (
    <DesktopPageShell title="New Request" noPadding>
      <div className="flex flex-col lg:flex-row gap-0 h-full min-h-[calc(100vh-64px)]">
        {/* ── LEFT SIDEBAR (Tablet horizontal / Desktop vertical) ────────────── */}
        <div className="w-full lg:w-[300px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-row lg:flex-col px-6 lg:px-8 py-5 lg:py-10 justify-between lg:justify-start gap-4 lg:gap-0 items-center lg:items-stretch">
          {/* Back */}
          <button
            type="button"
            onClick={() => nav({ to: "/tickets" as never, search: { status: "all" } as never })}
            className="flex items-center gap-2 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors mb-0 lg:mb-10 cursor-pointer shrink-0 w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to tickets</span>
          </button>

          {/* Steps */}
          <div className="flex flex-row lg:flex-col gap-2 sm:gap-3 lg:space-y-1">
            {STEPS.map(({ n, label, sublabel, icon: Icon }) => {
              const isActive = step === n;
              const isDone = step > n;
              return (
                <div key={n} className="relative">
                  {/* Connector line */}
                  {n < 3 && (
                    <div
                      className={`absolute left-[18px] top-[40px] w-px h-10 ${isDone || isActive ? "bg-blue-200" : "bg-slate-100"} hidden lg:block`}
                    />
                  )}
                  <button
                    type="button"
                    disabled={n > step}
                    onClick={() => n <= step && setStep(n)}
                    className={`flex items-center gap-2 sm:gap-4 w-auto lg:w-full rounded-xl px-3 py-2 sm:py-3 transition-all ${isActive ? "bg-blue-50" : isDone ? "hover:bg-slate-50 cursor-pointer" : "cursor-default"}`}
                  >
                    <div
                      className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : isDone
                            ? "bg-green-100 text-green-600"
                            : "bg-slate-100 text-slate-300"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="text-left hidden sm:block">
                      <p
                        className={`text-[12px] sm:text-[13px] font-bold ${isActive ? "text-blue-700" : isDone ? "text-slate-700" : "text-slate-300"}`}
                      >
                        {label}
                      </p>
                      <p
                        className={`text-[10px] sm:text-[11px] ${isActive ? "text-blue-500" : isDone ? "text-slate-400" : "text-slate-200"} hidden md:block`}
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
          <div className="hidden lg:block mt-auto pt-8 border-t border-slate-100">
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
          <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6">
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
          <div className="flex-1 px-6 sm:px-10 pb-10">{stepContent}</div>

          {/* Sticky footer actions */}
          <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-100 px-6 sm:px-10 py-5">
            <div className="flex items-center justify-between max-w-[860px] mx-auto w-full">
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
