import { ReactNode } from "react";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { DesktopHeader } from "@/components/layout/DesktopHeader";

/**
 * DesktopLayout — root shell for desktop viewport (≥768px).
 * Renders a collapsible sidebar on the left + a scrollable main content area on the right.
 * Mobile layout is handled separately in __root.tsx and is completely unaffected.
 */
export function DesktopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-foreground">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <DesktopHeader />
        <main className="flex-1 overflow-y-auto min-h-0">{children}</main>
      </div>
    </div>
  );
}
