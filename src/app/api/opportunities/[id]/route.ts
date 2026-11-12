import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";
import { decorateOpportunity } from "@/lib/server/services";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createDb();
  const opp = await db.getOpportunityById(id);
  if (!opp) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const viewerPostcode = searchParams.get("viewerPostcode");
  const decorated = await decorateOpportunity(db, opp, viewerPostcode);

  const signups = await db.getSignupsByOpportunity(opp.id);
  const attendees = await Promise.all(
    signups.map(async (s) => {
      const u = await db.getUserById(s.user_id);
      return {
        signup_id: s.id,
        user_id: s.user_id,
        name: u ? u.first_name : "Unknown",
        status: s.status,
      };
    }),
  );

  return NextResponse.json({ opportunity: decorated, attendees });
}
