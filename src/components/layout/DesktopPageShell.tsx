import { ReactNode } from "react";

interface DesktopPageShellProps {
  children: ReactNode;
  /** Optional page heading rendered as <h1> (now ignored as header is global, kept for TS compat) */
  title?: string;
  /** Set to true for full-bleed layouts (e.g. split-panel pages) that manage their own spacing */
  noPadding?: boolean;
}

/**
 * DesktopPageShell — consistent page content wrapper for desktop route pages.
 * Provides a single, unified px-8 py-8 inset so all tabs feel visually aligned.
 * Use `noPadding` for full-bleed layouts that must manage their own spacing.
 *
 * Mobile paths NEVER use this component — they render MobileShell instead.
 */
export function DesktopPageShell({ children, noPadding }: DesktopPageShellProps) {
  return (
    <div
      className={`w-full min-h-full flex flex-col ${noPadding ? "" : "px-4 sm:px-6 lg:px-8 py-6 sm:py-8"}`}
    >
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
