import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";
import { decorateOpportunity, isUpcoming, type DecoratedOpportunity } from "@/lib/server/services";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  const db = createDb();
  const user = userId ? await db.getUserById(userId) : null;
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const userSkills = user.skills ? user.skills.split("|").filter(Boolean) : [];
  const openOpportunities = (await db.getOpportunities()).filter((o) => o.status === "open" && isUpcoming(o));
  const decorated = (
    await Promise.all(openOpportunities.map((o) => decorateOpportunity(db, o, user.postcode)))
  ).filter((o) => o.spaces_left > 0);

  const scored = decorated.map((o) => {
    let score = 0;
    if (user.indoor_outdoor && user.indoor_outdoor !== "either" && o.indoor_outdoor === user.indoor_outdoor) score += 1;
    if (user.manual_pref && user.manual_pref !== "either" && o.manual === user.manual_pref) score += 1;
    if (user.solo_group && user.solo_group !== "either" && o.type === user.solo_group) score += 1;
    const skillMatches = o.skills.filter((s) => userSkills.includes(s)).length;
    score += skillMatches;
    return { ...o, _score: score };
  });

  scored.sort((a, b) => {
    if (b._score !== a._score) return b._score - a._score;
    if (a.distance_miles !== null && b.distance_miles !== null) return a.distance_miles - b.distance_miles;
    return 0;
  });

  const opportunities: DecoratedOpportunity[] = scored.slice(0, 3).map((o) => {
    const rest = { ...o };
    delete (rest as { _score?: number })._score;
    return rest;
  });
  return NextResponse.json({ opportunities });
}
