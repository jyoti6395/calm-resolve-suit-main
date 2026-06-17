import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface UserRoles {
  isTechnician: boolean;
  isCustomer: boolean;
}

export function getUserRoles(role: string | null | undefined): UserRoles {
  const normalized = role?.trim().toLowerCase() || "";
  return {
    isTechnician: normalized === "technician",
    isCustomer: normalized === "customer",
  };
}
