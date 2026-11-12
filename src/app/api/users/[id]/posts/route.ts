import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";
import { decorateOpportunity } from "@/lib/server/services";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createDb();
  const posts = (await db.getOpportunities()).filter((o) => o.poster_id === id);
  const decorated = await Promise.all(posts.map((o) => decorateOpportunity(db, o)));
  return NextResponse.json({ posts: decorated });
}
