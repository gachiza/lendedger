import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  accent: "indigo" | "emerald" | "violet" | "amber";
}

const ACCENTS = {
  indigo: {
    icon: "bg-indigo-100 text-indigo-600",
    ring: "ring-indigo-100",
  },
  emerald: {
    icon: "bg-emerald-100 text-emerald-600",
    ring: "ring-emerald-100",
  },
  violet: {
    icon: "bg-violet-100 text-violet-600",
    ring: "ring-violet-100",
  },
  amber: {
    icon: "bg-amber-100 text-amber-600",
    ring: "ring-amber-100",
  },
};

export default function StatsCard({ title, value, subtitle, icon, accent }: StatsCardProps) {
  const a = ACCENTS[accent];
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-4 ${a.icon} ${a.ring}`}>
          {icon}
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-slate-50 to-transparent opacity-60" />
    </div>
  );
}
