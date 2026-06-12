import { ReactNode } from "react";

export function MobileShell({
  children,
  className = "",
  scrollable = true,
}: {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
}) {
  return (
    <div className="h-full w-full bg-background flex justify-center overflow-hidden">
      <div
        className={`relative w-full max-w-[440px] h-full flex flex-col ${
          scrollable ? "overflow-y-auto no-scrollbar" : "overflow-hidden"
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
