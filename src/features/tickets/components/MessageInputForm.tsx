import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send } from "lucide-react";

const messageSchema = z.object({
  content: z.string().min(1, "Cannot send an empty message").max(500),
});

type MessageInput = z.infer<typeof messageSchema>;

interface MessageInputFormProps {
  onSendMessage: (content: string) => Promise<void>;
}

export function MessageInputForm({ onSendMessage }: MessageInputFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<MessageInput>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
  });

  const onSubmit = async (data: MessageInput) => {
    const content = data.content;
    reset(); // Reset input field instantly for a fast, responsive UI feel
    try {
      await onSendMessage(content);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 bg-background border-t border-border shrink-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center gap-2 bg-secondary rounded-[24px] p-1 border border-border/50 focus-within:border-primary/50 transition-colors"
      >
        <input
          {...register("content")}
          placeholder="Type a message..."
          autoComplete="off"
          className="flex-1 bg-transparent px-4 py-2 outline-none text-[15px] font-medium text-foreground placeholder:text-muted-foreground/50"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="p-3 rounded-full bg-gradient-brand text-primary-foreground shrink-0 shadow-elevated disabled:opacity-40 transition-all hover:opacity-90 active:scale-95"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
