import { useState, useEffect } from "react";
import { DesktopTicketGrid } from "./DesktopTicketGrid";
import { DesktopTicketTable } from "./DesktopTicketTable";
import { Search, LayoutGrid, List, X } from "lucide-react";
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
  searchParams: {
    search?: string;
    status?: string;
    priority?: string;
    page?: number;
    sortBy?: "newest" | "oldest" | "priority";
  };
}) {
  const navigate = useNavigate({ from: "/tickets/" });

  // Manage Layout State (Grid vs List)
  const [layout, setLayout] = useState<"grid" | "list">("list");

  // Search State & Sync
  const [searchValue, setSearchValue] = useState(searchParams.search || "");

  useEffect(() => {
    setSearchValue(searchParams.search || "");
  }, [searchParams.search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const searchVal = searchValue.trim() || undefined;
      if (searchParams.search !== searchVal) {
        navigate({
          search: (prev) => ({
            ...prev,
            search: searchVal,
            page: 1, // Reset page when searching
          }),
          replace: true,
        });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchValue, navigate, searchParams.search]);

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
      <div className="flex flex-col xl:flex-row gap-4 xl:items-center justify-between mb-8 bg-card rounded-2xl border border-border p-3 shadow-sm">
        {/* Left side: Search input */}
        <div className="relative w-full xl:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search by ID, subject, requester..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full h-10 pl-10 pr-9 rounded-xl bg-secondary/50 border border-transparent focus:border-border focus:bg-card focus:ring-2 focus:ring-primary/10 outline-none text-[13px] font-semibold text-foreground placeholder:text-muted-foreground/50 transition-all"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Right side: Tabs & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between xl:justify-end w-full xl:w-auto">
          {/* Status Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
            {tabs.map((t) => (
              <Button
                key={t.key}
                variant={activeTab === t.key ? "default" : "ghost"}
                onClick={() => handleTabClick(t.key)}
                className={`px-5 h-9 rounded-xl text-[13px] font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === t.key
                    ? "shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {t.label}
              </Button>
            ))}
          </div>

          {/* Sort & Layout Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/50 shrink-0">
            {/* Sort Dropdown */}
            <Select
              value={searchParams.sortBy || "newest"}
              onValueChange={(val) => {
                navigate({
                  search: (prev) => ({
                    ...prev,
                    sortBy: val as "newest" | "oldest" | "priority",
                    page: 1, // Reset page when sort options change
                  }),
                  replace: true,
                });
              }}
            >
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
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50 shrink-0">
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
