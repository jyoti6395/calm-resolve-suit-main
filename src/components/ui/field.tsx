import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<{ className?: string }>;
  trailing?: React.ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ icon: Icon, trailing, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
        <input
          ref={ref}
          type={currentType}
          {...props}
          className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        {trailing}
      </div>
    );
  },
);

Field.displayName = "Field";
