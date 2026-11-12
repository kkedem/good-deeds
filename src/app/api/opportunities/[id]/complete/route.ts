import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { attendee_signup_ids } = await request.json();

  const db = createDb();
  const opp = await db.getOpportunityById(id);
  if (!opp) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (opp.status === "completed") return NextResponse.json({ error: "already_completed" }, { status: 400 });

  const signups = (await db.getSignupsByOpportunity(opp.id)).filter((s) => s.status !== "cancelled");
  const hours = parseFloat(opp.hours);
  const confirmedIds = new Set<string>(attendee_signup_ids || []);

  let totalHours = 0;
  let totalVolunteers = 0;

  for (const s of signups) {
    if (confirmedIds.has(s.id)) {
      await db.updateSignup(s.id, {
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        points_awarded: String(Math.round(hours * 10)),
      });
      totalHours += hours;
      totalVolunteers += 1;
    } else {
      await db.updateSignup(s.id, { status: "cancelled" });
    }
  }

  await db.updateOpportunity(opp.id, { status: "completed" });

  return NextResponse.json({ message: `Done! ${totalVolunteers} volunteers confirmed for ${totalHours} total hours.` });
}
