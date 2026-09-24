import { NextResponse } from "next/server";
import { db } from "@/db";
import { loans } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db
      .select()
      .from(loans)
      .where(eq(loans.id, id))
      .limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.borrowerName !== undefined) updates.borrowerName = String(body.borrowerName);
    if (body.amountBorrowed !== undefined) updates.amountBorrowed = String(body.amountBorrowed);
    if (body.interestRate !== undefined) updates.interestRate = String(body.interestRate);
    if (body.totalToPay !== undefined) updates.totalToPay = String(body.totalToPay);
    if (body.loanDate !== undefined) updates.loanDate = String(body.loanDate);
    if (body.paymentDueDate !== undefined) updates.paymentDueDate = String(body.paymentDueDate);
    if (body.notes !== undefined) updates.notes = body.notes ? String(body.notes) : null;

    // Partial payment: addPayment adds to the running total
    if (body.addPayment !== undefined) {
      const addition = Number(body.addPayment);
      if (!Number.isFinite(addition) || addition <= 0) {
        return NextResponse.json(
          { error: "Payment amount must be greater than 0" },
          { status: 400 }
        );
      }
      const currentPaid = parseFloat(existing[0].amountPaid);
      const total = parseFloat(existing[0].totalToPay);
      const newPaid = Math.min(currentPaid + addition, total);
      updates.amountPaid = newPaid.toFixed(2);
      if (newPaid >= total) {
        updates.paid = true;
        updates.paidDate = new Date().toISOString().slice(0, 10);
      }
    }

    if (body.amountPaid !== undefined && body.addPayment === undefined) {
      updates.amountPaid = String(body.amountPaid);
    }

    if (body.paid !== undefined) {
      updates.paid = Boolean(body.paid);
      if (body.paid) {
        // If marking paid, ensure amountPaid equals totalToPay
        updates.amountPaid = existing[0].totalToPay;
        updates.paidDate = body.paidDate
          ? String(body.paidDate)
          : new Date().toISOString().slice(0, 10);
      } else {
        updates.paidDate = null;
      }
    }

    const [updated] = await db
      .update(loans)
      .set(updates)
      .where(eq(loans.id, id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update loan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(loans).where(eq(loans.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete loan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
