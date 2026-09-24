"use client";

import { useEffect, useState, type FormEvent } from "react";
import { todayISO } from "@/lib/loans";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface FormState {
  borrowerName: string;
  amountBorrowed: string;
  interestRate: string;
  totalToPay: string;
  loanDate: string;
  paymentDueDate: string;
  paid: boolean;
  notes: string;
}

const empty: FormState = {
  borrowerName: "",
  amountBorrowed: "",
  interestRate: "10",
  totalToPay: "",
  loanDate: todayISO(),
  paymentDueDate: "",
  paid: false,
  notes: "",
};

export default function AddLoanModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(empty);
      setError(null);
    }
  }, [open]);

  // Auto-compute total to pay
  useEffect(() => {
    const amt = parseFloat(form.amountBorrowed);
    const rate = parseFloat(form.interestRate);
    if (Number.isFinite(amt) && Number.isFinite(rate)) {
      const total = amt * (1 + rate / 100);
      setForm((f) => ({ ...f, totalToPay: total.toFixed(2) }));
    }
  }, [form.amountBorrowed, form.interestRate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.borrowerName.trim()) return setError("Borrower name is required");
    if (!form.amountBorrowed || parseFloat(form.amountBorrowed) <= 0)
      return setError("Amount borrowed must be greater than 0");
    if (form.interestRate === "" || parseFloat(form.interestRate) < 0)
      return setError("Interest rate is required");
    if (!form.loanDate) return setError("Loan date is required");
    if (!form.paymentDueDate) return setError("Payment due date is required");

    setSubmitting(true);
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrowerName: form.borrowerName.trim(),
          amountBorrowed: form.amountBorrowed,
          interestRate: form.interestRate,
          totalToPay: form.totalToPay,
          loanDate: form.loanDate,
          paymentDueDate: form.paymentDueDate,
          paid: form.paid,
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create loan");
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">New Loan Record</h2>
            <p className="text-xs text-slate-500">
              A unique loan ID will be generated automatically.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Borrower Name" required>
              <input
                type="text"
                value={form.borrowerName}
                onChange={(e) => setForm({ ...form, borrowerName: e.target.value })}
                placeholder="John Doe"
                className={inputCls}
              />
            </Field>

            <Field label="Amount Borrowed (UGX)" required>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amountBorrowed}
                onChange={(e) => setForm({ ...form, amountBorrowed: e.target.value })}
                placeholder="1000.00"
                className={inputCls}
              />
            </Field>

            <Field label="Interest Rate (%)" required>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.interestRate}
                onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
                placeholder="10"
                className={inputCls}
              />
            </Field>

            <Field label="Total To Be Paid Back (UGX)">
              <input
                type="number"
                step="0.01"
                value={form.totalToPay}
                onChange={(e) => setForm({ ...form, totalToPay: e.target.value })}
                className={`${inputCls} bg-slate-50 font-semibold text-slate-900`}
              />
              <p className="mt-1 text-xs text-slate-400">
                Auto-calculated: principal × (1 + rate/100)
              </p>
            </Field>

            <Field label="Loan Granted Date" required>
              <input
                type="date"
                value={form.loanDate}
                onChange={(e) => setForm({ ...form, loanDate: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Payment Due Date" required>
              <input
                type="date"
                value={form.paymentDueDate}
                onChange={(e) => setForm({ ...form, paymentDueDate: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Notes (optional)">
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Purpose, collateral, terms..."
              className={inputCls}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.paid}
              onChange={(e) => setForm({ ...form, paid: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Already paid in full
          </label>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Create Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
