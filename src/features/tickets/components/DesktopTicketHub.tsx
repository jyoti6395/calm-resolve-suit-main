import { useState } from "react";
import { DesktopTicketGrid } from "./DesktopTicketGrid";
import { DesktopTicketTable } from "./DesktopTicketTable";
import { Search, LayoutGrid, List } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DesktopTicketHub({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; priority?: string; page?: number };
}) {
  const navigate = useNavigate({ from: "/tickets/" });

  // Manage Layout State (Grid vs List)
  const [layout, setLayout] = useState<"grid" | "list">("list");

  const tabs = [
    { key: "all", label: "All Tickets" },
    { key: "open", label: "Open" },
    { key: "in_progress", label: "In Progress" },
    { key: "resolved", label: "Resolved" },
    { key: "closed", label: "Closed" },
  ];

  const handleTabClick = (key: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        status: key as "all" | "open" | "in_progress" | "resolved" | "closed",
        page: 1, // Reset page on filter change
      }),
      replace: true,
    });
  };

  const activeTab = searchParams.status || "all";

  return (
    <div className="flex flex-col flex-1 pb-10">
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between mb-8 bg-card rounded-2xl border border-border p-2 shadow-sm">
        {/* Left side: Status Pills */}
        <div className="flex items-center gap-1">
          {tabs.map((t) => (
            <Button
              key={t.key}
              variant={activeTab === t.key ? "default" : "ghost"}
              onClick={() => handleTabClick(t.key)}
              className={`px-5 h-9 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                activeTab === t.key
                  ? "shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </Button>
          ))}
        </div>

        {/* Right side: Sort & Layout Toggle */}
        <div className="flex items-center gap-4 px-2">
          {/* Sort Dropdown */}
          <Select defaultValue="newest">
            <SelectTrigger className="w-auto h-8 bg-transparent border-none shadow-none text-[13px] font-medium text-foreground focus:ring-0 focus:ring-offset-0 px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Sort by: Newest</SelectItem>
              <SelectItem value="oldest">Sort by: Oldest</SelectItem>
              <SelectItem value="priority">Sort by: Priority</SelectItem>
            </SelectContent>
          </Select>

          {/* Divider */}
          <div className="w-[1px] h-5 bg-border mx-1" />

          {/* Layout Toggle */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLayout("list")}
              className={`h-7 w-7 rounded-md transition-colors ${
                layout === "list"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLayout("grid")}
              className={`h-7 w-7 rounded-md transition-colors ${
                layout === "grid"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Render selected layout */}
      {layout === "grid" ? (
        <DesktopTicketGrid searchParams={searchParams} />
      ) : (
        <DesktopTicketTable searchParams={searchParams} />
      )}
    </div>
  );
}
