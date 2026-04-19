import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(date));
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

export function generateOrderNumber(count: number): string {
  return `DP-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;
}

export const TRUCK_SIZE_LABELS: Record<string, string> = {
  CARGO_VAN: "Cargo Van",
  SPRINTER_VAN: "Sprinter Van",
  BOX_TRUCK_16FT: "Box Truck 16ft",
  BOX_TRUCK_24FT: "Box Truck 24ft",
  FLATBED: "Flatbed",
  STEP_DECK: "Step Deck",
  LOWBOY: "Lowboy",
  SEMI_DRY_VAN: "Semi (Dry Van)",
  SEMI_REEFER: "Semi (Reefer)",
  SEMI_TANKER: "Semi (Tanker)",
  SEMI_DUMP: "Semi (Dump)",
  OTHER: "Other",
};

export const DISPATCH_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  CONFIRMED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  IN_TRANSIT: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  AT_PICKUP: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  LOADED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  AT_DELIVERY: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  DELIVERED: "bg-green-500/20 text-green-400 border-green-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
  ON_HOLD: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export const TRUCK_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-500/20 text-green-400 border-green-500/30",
  ON_ROUTE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  MAINTENANCE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  OUT_OF_SERVICE: "bg-red-500/20 text-red-400 border-red-500/30",
  RESERVED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};
