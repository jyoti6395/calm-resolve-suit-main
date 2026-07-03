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

export async function downloadFile(url: string, filename: string): Promise<void> {
  let downloadUrl = url;
  if (url.startsWith("https://firebasestorage.googleapis.com")) {
    downloadUrl = url.replace("https://firebasestorage.googleapis.com", "/storage-proxy");
  }

  try {
    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Failed to download file via blob fetch, falling back to new window:", error);
    // Fallback: trigger standard browser navigation / new tab
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
