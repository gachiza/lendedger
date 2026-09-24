"use client";

import { useState } from "react";
import type { Loan } from "@/db/schema";
import LoansTable from "@/components/LoansTable";
import AddLoanModal from "@/components/AddLoanModal";
import Link from "next/link";

interface Props {
  initialLoans: Loan[];
}

export default function RecordsClient({ initialLoans }: Props) {
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/loans", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data.data)) setLoans(data.data);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <span>/</span>
          <span className="text-slate-700">Records</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Loan Records
            </h1>
            <p className="text-sm text-slate-500">
              Manage and monitor all loan records in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}>
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Loan
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <LoansTable loans={loans} onChange={refresh} />
      </div>

      <AddLoanModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={refresh}
      />
    </div>
  );
}
