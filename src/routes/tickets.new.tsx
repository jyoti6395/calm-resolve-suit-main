import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Save, Loader2, Plus } from "lucide-react";

import { db } from "@/firebase/firebase";
import { useAppSelector } from "@/store/hooks";
import { serializeTimestamp } from "@/lib/formatters";
import { categories } from "@/lib/mock";

import { MobileShell } from "@/components/MobileShell";
import { AppHeader } from "@/components/AppHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// =========================================
// 1. RUNTIME VALIDATION CONTRACT (ZOD SCHEMA)
// =========================================
const createTicketSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters long")
    .max(100, "Title is too long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  category: z.string().min(1, "Please select a valid service category"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const Route = createFileRoute("/tickets/new")({ component: NewTicket });

function NewTicket() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================
  // 2. ISOLATED FORM ARCHITECTURE (REACT-HOOK-FORM)
  // =========================================
  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
    },
  });

  // =========================================
  // 3. SECURE MUTATION DISPATCH ENGINE
  // =========================================
  const onSubmit = async (data: CreateTicketInput) => {
    if (!user) {
      toast.error("You must be logged in to create a ticket.");
      return;
    }

    setIsSubmitting(true);
    try {
      const ticketPayload = {
        ...data,
        status: "open",
        createdBy: user.uid,
        assignedTo: null,
        createdAt: serializeTimestamp(new Date()),
        updatedAt: serializeTimestamp(new Date()),
        dueDate: null,
      };

      await addDoc(collection(db, "tickets"), ticketPayload);

      form.reset();
      toast.success("Ticket created successfully!");
      navigate({ to: "/tickets" });
    } catch (err: unknown) {
      console.error("Failed to create ticket:", err);
      const error =
        err instanceof Error ? err.message : "Failed to submit ticket. Please try again.";
      toast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileShell>
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader
          title="Raise a ticket"
          back
          right={
            <button className="text-[12px] font-semibold text-primary flex items-center gap-1">
              <Save className="h-3.5 w-3.5" /> Draft
            </button>
          }
        />

        {/* =========================================
            4. FLUTTER WEBVIEW GEOMETRY WRAPPERS
            ========================================= */}
        <div className="flex-1 w-full max-w-md mx-auto p-4 md:max-w-2xl md:p-8 animate-slide-up pb-32">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. VPN keeps disconnecting"
                        {...field}
                        className="h-14 px-4 rounded-2xl bg-secondary focus-visible:bg-card focus-visible:ring-1 focus-visible:ring-primary border-transparent text-[15px] font-semibold transition-all min-h-[44px]"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Category
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 px-4 rounded-2xl bg-secondary focus:bg-card focus:ring-1 focus:ring-primary border-transparent text-[15px] font-semibold transition-all min-h-[44px]">
                          <SelectValue placeholder="Select a service category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.key} value={c.key} className="min-h-[44px]">
                            <div className="flex items-center gap-2">
                              <span>{c.icon}</span>
                              <span>{c.key}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Priority
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 px-4 rounded-2xl bg-secondary focus:bg-card focus:ring-1 focus:ring-primary border-transparent text-[15px] font-semibold transition-all min-h-[44px]">
                          <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low" className="min-h-[44px]">
                          Low
                        </SelectItem>
                        <SelectItem value="medium" className="min-h-[44px]">
                          Medium
                        </SelectItem>
                        <SelectItem value="high" className="min-h-[44px]">
                          High
                        </SelectItem>
                        <SelectItem value="urgent" className="min-h-[44px]">
                          Urgent
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What happened? What did you expect? Steps to reproduce…"
                        {...field}
                        rows={6}
                        className="p-4 rounded-2xl bg-secondary focus-visible:bg-card focus-visible:ring-1 focus-visible:ring-primary border-transparent text-[14px] resize-none transition-all min-h-[44px]"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold shadow-elevated disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </MobileShell>
  );
}
