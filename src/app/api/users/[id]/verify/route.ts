import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";
import { sanitiseUser } from "@/lib/server/services";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createDb();
  const user = await db.updateUser(id, { id_verified: "true" });
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ user: await sanitiseUser(db, user) });
}
