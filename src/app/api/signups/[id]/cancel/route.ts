import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createDb();
  const signup = await db.updateSignup(id, { status: "cancelled" });
  if (!signup) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ signup });
}
