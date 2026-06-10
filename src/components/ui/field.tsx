import React, { forwardRef } from "react";

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<{ className?: string }>;
  trailing?: React.ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ icon: Icon, trailing, ...props }, ref) => {
    return (
      <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-secondary border border-transparent focus-within:border-primary focus-within:bg-card focus-within:shadow-soft transition-all">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
        <input
          ref={ref}
          {...props}
          className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
        />
        {trailing}
      </div>
    );
  },
);

Field.displayName = "Field";
