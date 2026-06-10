import { ReactNode } from "react";

export function MobileShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className={`relative w-full max-w-[440px] min-h-screen ${className}`}>{children}</div>
    </div>
  );
}
