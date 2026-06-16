import { Pencil } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

interface UserProfileCardProps {
  onEditClick: () => void;
}

export function UserProfileCard({ onEditClick }: UserProfileCardProps) {
  const { user } = useAppSelector((state) => state.auth);

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
    return "US";
  };

  return (
    <div className="mx-5 rounded-3xl bg-gradient-hero text-white p-5 shadow-elevated relative overflow-hidden">
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary-glow/40 blur-3xl" />
      <div className="relative flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-[22px] font-extrabold text-white">
          {getInitials()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[17px] font-bold truncate">{user?.displayName || "Guest User"}</p>
          <p className="text-[12px] text-white/70 truncate">{user?.email || "Not logged in"}</p>
          <p className="text-[10px] text-white/60 mt-0.5 truncate">
            Personal · {user?.role || "Customer"}
          </p>
        </div>
        <button
          onClick={onEditClick}
          className="h-10 w-10 shrink-0 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/25 active:scale-95 transition-all focus:outline-none"
        >
          <Pencil className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}
