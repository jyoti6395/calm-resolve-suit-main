import { Bell, HelpCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function DesktopHeader() {
  return (
    <header className="h-[72px] px-8 flex items-center justify-end shrink-0 border-b border-border bg-background/95 backdrop-blur z-10 sticky top-0">
      <div className="flex items-center gap-6">
        {/* Utility Icons */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Link to="/notifications" className="hover:text-foreground transition-colors relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
