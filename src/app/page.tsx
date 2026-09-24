import Link from "next/link";
import { db } from "@/db";
import { loans } from "@/db/schema";
import { desc } from "drizzle-orm";
import StatsCard from "@/components/StatsCard";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, formatDate, getLoanStatus } from "@/lib/loans";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const allLoans = await db.select().from(loans).orderBy(desc(loans.createdAt));

  let totalLoaned = 0;
  let totalInvested = 0;
  let balance = 0;
  let paidCount = 0;
  let pendingCount = 0;
  let pastDueCount = 0;

  for (const l of allLoans) {
    const amt = parseFloat(l.amountBorrowed);
    const tot = parseFloat(l.totalToPay);
    const paid = parseFloat(l.amountPaid);
    totalLoaned += amt;
    totalInvested += tot;
    const outstanding = Math.max(0, tot - paid);
    const st = getLoanStatus(l);
    if (st === "paid") {
      paidCount++;
    } else {
      balance += outstanding;
      if (st === "pending") pendingCount++;
      else pastDueCount++;
    }
  }

  const recent = allLoans.slice(0, 5);
  const interestEarned = totalInvested - totalLoaned;

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <span>/</span>
          <span className="text-slate-700">Dashboard</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Overview of your lending portfolio at a glance.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Amount Loaned Out"
          value={formatCurrency(totalLoaned)}
          subtitle={`${allLoans.length} loan${allLoans.length === 1 ? "" : "s"} issued`}
          accent="indigo"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatsCard
          title="Total Amount Invested"
          value={formatCurrency(totalInvested)}
          subtitle={`Includes ${formatCurrency(interestEarned)} interest`}
          accent="violet"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          }
        />
        <StatsCard
          title="Account Balance"
          value={formatCurrency(balance)}
          subtitle="Outstanding amount still owed"
          accent="amber"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          }
        />
        <StatsCard
          title="Active Loans"
          value={String(pendingCount + pastDueCount)}
          subtitle={`${pastDueCount} past due · ${paidCount} paid`}
          accent="emerald"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
      </div>

      {/* Status breakdown + Recent */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <h2 className="text-sm font-semibold text-slate-900">Status Breakdown</h2>
          <p className="text-xs text-slate-500">Distribution across all records.</p>
          <div className="mt-5 space-y-3">
            <BreakdownRow
              label="Paid"
              count={paidCount}
              total={allLoans.length}
              color="bg-emerald-500"
            />
            <BreakdownRow
              label="Pending"
              count={pendingCount}
              total={allLoans.length}
              color="bg-amber-500"
            />
            <BreakdownRow
              label="Past Due"
              count={pastDueCount}
              total={allLoans.length}
              color="bg-rose-500"
            />
          </div>
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 ring-1 ring-slate-100">
            <p className="font-medium text-slate-700">Legend</p>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span><b>Paid</b> — fully repaid.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span><b>Pending</b> — due date not yet passed.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span><b>Past Due</b> — overdue payment.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Records</h2>
              <p className="text-xs text-slate-500">Latest 5 loan entries.</p>
            </div>
            <Link
              href="/records"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
            >
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-slate-200 p-8 text-center">
              <p className="text-sm text-slate-600">No loan records yet.</p>
              <Link
                href="/records"
                className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Create your first loan
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {recent.map((l) => {
                const status = getLoanStatus(l);
                return (
                  <li key={l.id} className="flex items-center gap-4 py-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white">
                      {l.borrowerName
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {l.borrowerName}
                        </p>
                        <span className="font-mono text-[10px] text-slate-400">
                          {l.loanNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Due {formatDate(l.paymentDueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(l.totalToPay)}
                      </p>
                      <StatusBadge status={status} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total === 0 ? 0 : (count / total) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="tabular-nums text-slate-500">
          {count} <span className="text-slate-400">({pct.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
