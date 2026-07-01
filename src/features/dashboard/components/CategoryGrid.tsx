import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { getUserRoles } from "@/lib/utils";
import { Department } from "@/types/store";
import { getDepartmentStyle } from "@/features/tickets/components/NewTicketForm";

interface CategoryGridProps {
  departments: Department[];
  loading: boolean;
}

export function CategoryGrid({ departments, loading }: CategoryGridProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { isCustomer } = getUserRoles(user?.role);

  if (!isCustomer) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="px-5 mt-7 flex items-center justify-between">
        <h2 className="text-[15px] font-bold">How can we help?</h2>
        <Link to="/tickets/new" className="text-[12px] text-primary font-semibold">
          See all
        </Link>
      </div>
      <div className="px-5 mt-3">
        <div className="grid grid-cols-2 gap-3">
          {departments.map((dept) => {
            const style = getDepartmentStyle(dept.categoryKey || dept.id, dept.name);
            const Icon = style.icon;
            return (
              <Link
                to="/tickets/new"
                search={{ category: dept.id }}
                key={dept.id}
                className="rounded-2xl bg-card border border-border/85 p-4 shadow-sm hover:shadow-soft hover:-translate-y-0.5 active:scale-[0.98] transition-all flex flex-col justify-between animate-fade-in"
              >
                <div
                  className={`h-10 w-10 rounded-full ${style.bg} flex items-center justify-center shrink-0 self-start`}
                >
                  <Icon className={`h-5 w-5 ${style.color}`} />
                </div>
                <div className="mt-4">
                  <p className="text-[13px] font-bold text-foreground leading-snug">{dept.name}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
                    {dept.description || dept.desc || ""}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
