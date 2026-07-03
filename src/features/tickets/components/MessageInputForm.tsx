import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Image as ImageIcon, X } from "lucide-react";
import { useState, useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/firebase";
import { toast } from "sonner";

const messageSchema = z.object({
  content: z.string().max(500),
});

type MessageInput = z.infer<typeof messageSchema>;

interface MessageInputFormProps {
  ticketId: string;
  userId: string;
  onSendMessage: (content: string, imageUrl?: string) => Promise<void>;
}

export function MessageInputForm({ ticketId, userId, onSendMessage }: MessageInputFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<MessageInput>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Simple validation for image type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        return;
      }

      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size should be less than 5MB.");
        return;
      }

      setSelectedFile(file);

      // Revoke old preview URL if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: MessageInput) => {
    const content = data.content.trim();
    if (!content && !selectedFile) {
      return;
    }

    setIsUploading(true);
    let attachmentUrl = "";

    try {
      if (selectedFile) {
        // Upload to Firebase Storage using the authorized path structure
        const fileExtension = selectedFile.name.split(".").pop();
        const storageRef = ref(
          storage,
          `tickets/attachments/${userId || "anonymous"}/${ticketId || "general"}/chat_${Date.now()}.${fileExtension}`,
        );
        const metadata = {
          contentDisposition: `attachment; filename="${selectedFile.name}"`,
        };
        const snapshot = await uploadBytes(storageRef, selectedFile, metadata);
        attachmentUrl = await getDownloadURL(snapshot.ref);
      }

      // Reset text inputs and file states before callback to keep UI fast
      reset();
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await onSendMessage(content, attachmentUrl);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message or upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 bg-background border-t border-border shrink-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      {/* File Preview Container */}
      {previewUrl && (
        <div className="mb-3 flex items-center gap-2 bg-secondary/50 border border-border/50 p-2 rounded-2xl w-fit max-w-[200px] relative group animate-in fade-in zoom-in-95 duration-200">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-16 h-16 object-cover rounded-xl border border-border shadow-sm"
          />
          <div className="flex-1 min-w-0 pr-6">
            <p className="text-[11px] font-semibold text-foreground truncate">
              {selectedFile?.name}
            </p>
            <p className="text-[9px] text-muted-foreground font-medium mt-0.5">
              {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={removeSelectedFile}
            className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-destructive text-destructive-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center gap-2 bg-secondary rounded-[24px] p-1 border border-border/50 focus-within:border-primary/50 transition-colors"
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-full hover:bg-muted-foreground/10 text-muted-foreground transition-all active:scale-95 shrink-0 ml-1 cursor-pointer"
          title="Attach image"
        >
          <ImageIcon className="h-4 w-4" />
        </button>

        <input
          {...register("content")}
          placeholder="Type a message..."
          autoComplete="off"
          className="flex-1 bg-transparent px-2 py-2 outline-none text-[15px] font-medium text-foreground placeholder:text-muted-foreground/50"
        />
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="p-3 rounded-full bg-gradient-brand text-primary-foreground shrink-0 shadow-elevated disabled:opacity-40 transition-all hover:opacity-90 active:scale-95 mr-1 cursor-pointer flex items-center justify-center"
        >
          {isUploading ? (
            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}
