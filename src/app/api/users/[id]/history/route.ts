import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createDb();
  const signups = await db.getSignupsByUser(id);

  const history = await Promise.all(
    signups.map(async (s) => {
      const opp = await db.getOpportunityById(s.opportunity_id);
      return {
        signup_id: s.id,
        opportunity_id: s.opportunity_id,
        title: opp ? opp.title : "Unknown opportunity",
        date: opp ? opp.date : "",
        hours: opp ? parseFloat(opp.hours) : 0,
        status: s.status,
        category: opp ? opp.category : "",
        points_awarded: s.points_awarded || "0",
      };
    }),
  );

  history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json({ history });
}
