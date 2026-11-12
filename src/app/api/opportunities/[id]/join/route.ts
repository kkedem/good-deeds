import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user_id } = await request.json();

  const db = createDb();
  const opp = await db.getOpportunityById(id);
  if (!opp) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (opp.status !== "open") {
    return NextResponse.json({ error: "completed", message: "This opportunity is no longer open." }, { status: 400 });
  }

  const signups = await db.getSignupsByOpportunity(opp.id);
  const existing = signups.find((s) => s.user_id === user_id && s.status !== "cancelled");
  if (existing) {
    return NextResponse.json(
      { error: "already_joined", message: "You have already joined this opportunity." },
      { status: 409 },
    );
  }

  const active = signups.filter((s) => s.status !== "cancelled");
  if (active.length >= parseInt(opp.capacity, 10)) {
    return NextResponse.json({ error: "full", message: "This opportunity is full" }, { status: 400 });
  }

  const signup = await db.createSignup({ opportunity_id: opp.id, user_id, status: "joined" });
  return NextResponse.json({ signup }, { status: 201 });
}
