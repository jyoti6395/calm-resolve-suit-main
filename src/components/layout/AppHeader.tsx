import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function AppHeader({
  title,
  subtitle,
  right,
  back = false,
  transparent = false,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  back?: boolean;
  transparent?: boolean;
}) {
  const router = useRouter();
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById("global-header-container");
    if (el) setContainer(el);
  }, []);

  const headerContent = (
    <header
      className={`px-5 pt-[env(safe-area-inset-top)] w-full transition-colors ${transparent ? "bg-transparent" : "bg-background/80 backdrop-blur-xl"}`}
    >
      <div className="h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {back && (
            <button
              onClick={() => router.history.back()}
              className="h-10 w-10 -ml-2 rounded-full hover:bg-muted flex items-center justify-center text-foreground"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="min-w-0">
            {title && (
              <h1 className="text-[17px] font-bold text-foreground truncate leading-tight">
                {title}
              </h1>
            )}
            {subtitle && <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );

  if (!container) return headerContent;
  return createPortal(headerContent, container);
}

export { Link };
