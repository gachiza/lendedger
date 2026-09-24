"use client";

import { useState } from "react";
import type { Loan } from "@/db/schema";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDate, getLoanStatus } from "@/lib/loans";

interface Props {
  loans: Loan[];
  onChange: () => void;
}

export default function LoansTable({ loans, onChange }: Props) {
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "past_due">("all");
  const [search, setSearch] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [paying, setPaying] = useState(false);

  const rows = loans.filter((l) => {
    const status = getLoanStatus(l);
    if (filter !== "all" && filter !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.borrowerName.toLowerCase().includes(q) ||
        l.loanNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  async function markPaid(loan: Loan) {
    await fetch(`/api/loans/${loan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid: !loan.paid }),
    });
    onChange();
  }

  async function submitPayment(loan: Loan) {
    const val = parseFloat(payAmount);
    if (!Number.isFinite(val) || val <= 0) return;
    setPaying(true);
    try {
      await fetch(`/api/loans/${loan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addPayment: val }),
      });
      setPayingId(null);
      setPayAmount("");
      onChange();
    } finally {
      setPaying(false);
    }
  }

  async function remove(loan: Loan) {
    if (!confirm(`Delete loan ${loan.loanNumber} for ${loan.borrowerName}?`)) return;
    await fetch(`/api/loans/${loan.id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "pending", "paid", "past_due"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f === "all"
                ? "All"
                : f === "past_due"
                ? "Past Due"
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or ID..."
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/60">
            <tr>
              <Th>Loan ID</Th>
              <Th>Borrower</Th>
              <Th>Amount</Th>
              <Th>Rate</Th>
              <Th>Total To Pay</Th>
              <Th>Paid</Th>
              <Th>Balance</Th>
              <Th>Granted</Th>
              <Th>Due</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-16 text-center text-sm text-slate-500">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <p className="mt-3 font-medium text-slate-700">No records found</p>
                  <p className="mt-1 text-xs">Create a new loan to get started.</p>
                </td>
              </tr>
            ) : (
              rows.map((l) => {
                const status = getLoanStatus(l);
                const paidAmt = parseFloat(l.amountPaid);
                const totalAmt = parseFloat(l.totalToPay);
                const balanceAmt = Math.max(0, totalAmt - paidAmt);
                const isPaying = payingId === l.id;
                return (
                  <tr key={l.id} className="hover:bg-slate-50/60">
                    <Td>
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        {l.loanNumber}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
                          {l.borrowerName
                            .split(" ")
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-800">
                          {l.borrowerName}
                        </span>
                      </div>
                    </Td>
                    <Td mono>{formatCurrency(l.amountBorrowed)}</Td>
                    <Td mono>{parseFloat(l.interestRate).toFixed(2)}%</Td>
                    <Td mono bold>{formatCurrency(l.totalToPay)}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums text-sm text-slate-700">
                          {formatCurrency(paidAmt)}
                        </span>
                        {l.paid ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            FULL
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setPayingId(l.id);
                              setPayAmount("");
                            }}
                            title="Record partial payment"
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {isPaying && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            autoFocus
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") submitPayment(l);
                              if (e.key === "Escape") setPayingId(null);
                            }}
                            placeholder="UGX amount"
                            className="w-32 rounded-md border border-indigo-300 bg-white px-2 py-1 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                          />
                          <button
                            onClick={() => submitPayment(l)}
                            disabled={paying}
                            className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                          >
                            {paying ? "…" : "Add"}
                          </button>
                          <button
                            onClick={() => setPayingId(null)}
                            className="rounded-md px-1.5 py-1 text-xs text-slate-500 hover:bg-slate-100"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </Td>
                    <Td>
                      <span
                        className={`font-mono tabular-nums text-sm font-semibold ${
                          balanceAmt === 0 ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {formatCurrency(balanceAmt)}
                      </span>
                      {balanceAmt === 0 && !l.paid && (
                        <p className="text-[10px] text-slate-400">Settled</p>
                      )}
                    </Td>
                    <Td>{formatDate(l.loanDate)}</Td>
                    <Td>{formatDate(l.paymentDueDate)}</Td>
                    <Td>
                      <StatusBadge status={status} />
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => markPaid(l)}
                          title={l.paid ? "Mark as unpaid" : "Mark as paid"}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            l.paid
                              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {l.paid ? "Undo" : "Mark Paid"}
                        </button>
                        <button
                          onClick={() => remove(l)}
                          title="Delete"
                          className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/40 px-6 py-3 text-xs text-slate-500">
          Showing {rows.length} of {loans.length} record{loans.length === 1 ? "" : "s"}
        </div>
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  mono,
  bold,
}: {
  children: React.ReactNode;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <td
      className={`px-6 py-4 text-sm whitespace-nowrap text-slate-700 ${
        mono ? "font-mono tabular-nums" : ""
      } ${bold ? "font-semibold text-slate-900" : ""}`}
    >
      {children}
    </td>
  );
}
