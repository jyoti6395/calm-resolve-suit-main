import { Link } from "@tanstack/react-router";
import { Terminal, Key, Wifi, ClipboardList, Laptop, Sparkles } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { getUserRoles } from "@/lib/utils";

export const categoriesList = [
  {
    title: "Technical Support",
    desc: "App issues, errors, bugs",
    icon: Terminal,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    categoryKey: "Software",
  },
  {
    title: "Account Access",
    desc: "Login, password, 2FA",
    icon: Key,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    categoryKey: "Access",
  },
  {
    title: "Connectivity",
    desc: "Internet, Wi-Fi, VPN",
    icon: Wifi,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    categoryKey: "Network",
  },
  {
    title: "Service Request",
    desc: "Request a new service or assistance",
    icon: ClipboardList,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    categoryKey: "Service",
  },
  {
    title: "Product Support",
    desc: "Features and how-tos",
    icon: Laptop,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    categoryKey: "Hardware",
  },
  {
    title: "General Enquiries",
    desc: "Other queries",
    icon: Sparkles,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    categoryKey: "Other",
  },
];

export function CategoryGrid() {
  const { user } = useAppSelector((state) => state.auth);
  const { isCustomer } = getUserRoles(user?.role);

  if (!isCustomer) return null;

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
          {categoriesList.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                to="/tickets/new"
                search={{ category: cat.categoryKey }}
                key={cat.title}
                className="rounded-2xl bg-card border border-border/85 p-4 shadow-sm hover:shadow-soft hover:-translate-y-0.5 active:scale-[0.98] transition-all flex flex-col justify-between"
              >
                <div
                  className={`h-10 w-10 rounded-full ${cat.bg} flex items-center justify-center shrink-0 self-start`}
                >
                  <Icon className={`h-5 w-5 ${cat.color}`} />
                </div>
                <div className="mt-4">
                  <p className="text-[13px] font-bold text-foreground leading-snug">{cat.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground  leading-normal">
                    {cat.desc}
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
