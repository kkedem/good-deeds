import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";
import { sanitiseUser } from "@/lib/server/services";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password) {
    const missing = !email ? "email" : "password";
    return NextResponse.json(
      { error: `missing_${missing}`, message: `Please enter your ${missing}.` },
      { status: 400 },
    );
  }

  const db = createDb();
  const user = await db.getUserByEmail(email);
  if (!user) {
    return NextResponse.json(
      { error: "not_found", message: "We couldn't find an account with that email" },
      { status: 404 },
    );
  }

  return NextResponse.json({ user: await sanitiseUser(db, user) });
}
