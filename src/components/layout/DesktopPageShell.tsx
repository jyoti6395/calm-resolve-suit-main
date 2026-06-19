import { ReactNode } from "react";

interface DesktopPageShellProps {
  children: ReactNode;
  /** Optional page heading rendered as <h1> (now ignored as header is global, kept for TS compat) */
  title?: string;
}

/**
 * DesktopPageShell — consistent page content wrapper for desktop route pages.
 * Provides max-width constraint and padding.
 * Used by every desktop route to avoid duplicating layout boilerplate.
 *
 * Mobile paths NEVER use this component — they render MobileShell instead.
 */
export function DesktopPageShell({ children }: DesktopPageShellProps) {
  return (
    <div className="w-full min-h-full px-10 py-8 flex flex-col">
      {/* Page Content */}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
