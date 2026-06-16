import React, { useState, useEffect } from "react";
import { X, User, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateUserProfile } from "@/services/authService";
import { getUserProfile } from "@/services/authService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAuthUser } from "@/store/authSlice";

interface EditProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileSheet({ isOpen, onClose }: EditProfileSheetProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);

  // Initialize form fields when the sheet opens
  useEffect(() => {
    const loadProfile = async () => {
      if (isOpen && user?.uid) {
        try {
          const prof = await getUserProfile(user.uid);
          setFullName(prof?.fullName || user.displayName || "");
          setCompany(prof?.company || "");
        } catch (e) {
          console.error(e);
        }
      }
    };
    loadProfile();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    const trimmedName = fullName.trim();
    const trimmedCompany = company.trim();

    if (!trimmedName) {
      toast.error("Full Name cannot be empty.");
      return;
    }
    if (!trimmedCompany) {
      toast.error("Company cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      // API call is delegated to authService
      await updateUserProfile(user.uid, {
        fullName: trimmedName,
        company: trimmedCompany,
      });

      // Synchronize context state
      dispatch(
        setAuthUser({
          ...user,
          displayName: trimmedName,
        }),
      );

      toast.success("Profile updated successfully!");
      onClose();
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update profile. Please try again.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-[3px] transition-all duration-300 animate-fade-in left-1/2 -translate-x-1/2 w-full max-w-[440px]">
      {/* Click backdrop to close */}
      <div className="flex-1" onClick={onClose} aria-hidden="true" />

      {/* Drawer content */}
      <div className="relative w-full rounded-t-[2.5rem] bg-card border-t border-border p-6 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] flex flex-col shadow-elevated animate-slide-up h-auto max-h-[85vh] overflow-y-auto">
        {/* Header indicator bar */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />

        {/* Title */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[19px] font-extrabold text-foreground tracking-tight">
              Edit Profile
            </h3>
            <p className="text-[11.5px] text-muted-foreground">
              Keep your account details up to date.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="h-8 w-8 rounded-full bg-secondary hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Inputs container */}
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
                Full Name
              </label>
              <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Petrov"
                  disabled={saving}
                  className="flex-1 bg-transparent outline-none text-[14.5px] text-foreground placeholder:text-muted-foreground/45 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Company */}
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
                Company
              </label>
              <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  disabled={saving}
                  className="flex-1 bg-transparent outline-none text-[14.5px] text-foreground placeholder:text-muted-foreground/45 disabled:opacity-50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-13 flex-1 rounded-xl bg-secondary hover:bg-muted text-[13.5px] font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-13 flex-[2] rounded-xl bg-gradient-brand text-primary-foreground text-[13.5px] font-bold shadow-elevated hover:shadow-glow flex items-center justify-center gap-1.5 transition-all disabled:opacity-85 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
