import { NextResponse } from "next/server";
import { db } from "@/db";
import { loans } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";

// GET /api/loans - list all loans
export async function GET() {
  try {
    const rows = await db
      .select()
      .from(loans)
      .orderBy(desc(loans.createdAt));
    return NextResponse.json({ data: rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch loans";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/loans - create a new loan with auto-generated ID
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      borrowerName,
      amountBorrowed,
      interestRate,
      totalToPay,
      loanDate,
      paymentDueDate,
      paid,
      paidDate,
      notes,
    } = body ?? {};

    if (!borrowerName || !amountBorrowed || interestRate === undefined || !loanDate || !paymentDueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate auto-incrementing loan number LN-00001
    const latest = await db
      .select({ loanNumber: loans.loanNumber })
      .from(loans)
      .orderBy(desc(loans.loanNumber))
      .limit(1);

    let nextSeq = 1;
    if (latest.length > 0) {
      const match = latest[0].loanNumber.match(/LN-(\d+)/);
      if (match) {
        nextSeq = parseInt(match[1], 10) + 1;
      }
    }
    const loanNumber = `LN-${String(nextSeq).padStart(5, "0")}`;

    const amount = Number(amountBorrowed);
    const rate = Number(interestRate);
    const computedTotal =
      totalToPay !== undefined && totalToPay !== null && totalToPay !== ""
        ? Number(totalToPay)
        : amount * (1 + rate / 100);

    const initialPaid = body.amountPaid ? Math.max(0, Number(body.amountPaid)) : 0;
    const isPaidAtCreate = Boolean(paid) || initialPaid >= computedTotal;

    const [created] = await db
      .insert(loans)
      .values({
        loanNumber,
        borrowerName: String(borrowerName).trim(),
        amountBorrowed: String(amount),
        interestRate: String(rate),
        totalToPay: String(computedTotal),
        amountPaid: isPaidAtCreate ? String(computedTotal) : String(initialPaid),
        loanDate: String(loanDate),
        paymentDueDate: String(paymentDueDate),
        paid: isPaidAtCreate,
        paidDate: isPaidAtCreate
          ? new Date().toISOString().slice(0, 10)
          : paidDate
          ? String(paidDate)
          : null,
        notes: notes ? String(notes) : null,
      })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create loan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helper for stats - used internally
export async function computeStats() {
  const rows = await db.select().from(loans);
  let totalLoaned = 0;
  let totalInvested = 0;
  let balance = 0;
  for (const r of rows) {
    const amt = parseFloat(r.amountBorrowed);
    const tot = parseFloat(r.totalToPay);
    totalLoaned += amt;
    totalInvested += tot;
    if (!r.paid) balance += tot;
  }
  return { totalLoaned, totalInvested, balance, count: rows.length };
}

export { sql, eq };
