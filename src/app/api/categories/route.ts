import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";

export async function GET() {
  const db = createDb();
  const categories = await db.getCategories();
  return NextResponse.json({ categories });
}
