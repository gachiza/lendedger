import type { Loan } from "@/db/schema";

export type LoanStatus = "paid" | "pending" | "past_due";

export function getLoanStatus(loan: Loan): LoanStatus {
  if (loan.paid) return "paid";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(loan.paymentDueDate);
  due.setHours(0, 0, 0, 0);
  if (due.getTime() < today.getTime()) return "past_due";
  return "pending";
}

export const STATUS_CONFIG: Record<
  LoanStatus,
  { label: string; bg: string; text: string; dot: string; ring: string }
> = {
  paid: {
    label: "Paid",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
  },
  past_due: {
    label: "Past Due",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    ring: "ring-rose-200",
  },
};

export function formatCurrency(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(n)) return "UGX 0";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
