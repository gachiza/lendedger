import { db } from "@/db";
import { loans } from "@/db/schema";
import { desc } from "drizzle-orm";
import RecordsClient from "./RecordsClient";

export const dynamic = "force-dynamic";

export default async function RecordsPage() {
  const allLoans = await db.select().from(loans).orderBy(desc(loans.createdAt));
  return <RecordsClient initialLoans={allLoans} />;
}
