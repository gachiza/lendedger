import {
  pgTable,
  uuid,
  varchar,
  numeric,
  date,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const loans = pgTable("loans", {
  id: uuid("id").defaultRandom().primaryKey(),
  loanNumber: varchar("loan_number", { length: 32 }).notNull().unique(),
  borrowerName: varchar("borrower_name", { length: 255 }).notNull(),
  amountBorrowed: numeric("amount_borrowed", { precision: 14, scale: 2 })
    .notNull(),
  interestRate: numeric("interest_rate", { precision: 6, scale: 2 }).notNull(),
  totalToPay: numeric("total_to_pay", { precision: 14, scale: 2 }).notNull(),
  loanDate: date("loan_date").notNull(),
  paymentDueDate: date("payment_due_date").notNull(),
  amountPaid: numeric("amount_paid", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  paid: boolean("paid").notNull().default(false),
  paidDate: date("paid_date"),
  notes: varchar("notes", { length: 1000 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Loan = typeof loans.$inferSelect;
export type NewLoan = typeof loans.$inferInsert;
