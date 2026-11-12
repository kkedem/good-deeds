import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";
import { sanitiseUser } from "@/lib/server/services";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createDb();
  const user = await db.getUserById(id);
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ user: await sanitiseUser(db, user) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { indoor_outdoor, manual_pref, skills, solo_group } = body;

  const patch: Record<string, string> = {};
  if (indoor_outdoor !== undefined) patch.indoor_outdoor = indoor_outdoor;
  if (manual_pref !== undefined) patch.manual_pref = manual_pref;
  if (solo_group !== undefined) patch.solo_group = solo_group;
  if (skills !== undefined) patch.skills = Array.isArray(skills) ? skills.join("|") : skills;

  const db = createDb();
  const user = await db.updateUser(id, patch);
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ user: await sanitiseUser(db, user) });
}
