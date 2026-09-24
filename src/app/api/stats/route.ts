import { NextResponse } from "next/server";
import { computeStats } from "@/app/api/loans/route";

export async function GET() {
  try {
    const stats = await computeStats();
    return NextResponse.json({ data: stats });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
