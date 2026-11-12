import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createDb();
  const signups = await db.getSignups();
  const current = signups.find((s) => s.id === id);
  if (!current) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const opp = await db.getOpportunityById(current.opportunity_id);
  if (opp && opp.status === "completed") {
    const hours = parseFloat(opp.hours);
    const signup = await db.updateSignup(current.id, {
      status: "confirmed",
      done_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      points_awarded: String(Math.round(hours * 10)),
    });
    return NextResponse.json({ signup, message: "Hours confirmed straight away." });
  }

  const signup = await db.updateSignup(current.id, { status: "pending", done_at: new Date().toISOString() });
  return NextResponse.json({ signup, message: "Nice one! Your hours are pending until the organiser confirms." });
}
