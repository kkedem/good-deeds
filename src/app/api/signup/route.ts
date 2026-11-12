import { NextResponse } from "next/server";
import { createDb, isValidUkPostcode } from "@/lib/server/db";
import { calcAge, sanitiseUser } from "@/lib/server/services";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    first_name, email, date_of_birth, postcode,
    indoor_outdoor, manual_pref, skills, solo_group, terms_accepted,
  } = body;

  if (!first_name || !email || !date_of_birth || !postcode) {
    return NextResponse.json(
      { error: "missing_fields", message: "Please fill in all required fields." },
      { status: 400 },
    );
  }
  if (!isValidUkPostcode(postcode)) {
    return NextResponse.json(
      { error: "invalid_postcode", message: "Please enter a valid UK postcode" },
      { status: 400 },
    );
  }

  const db = createDb();
  if (await db.getUserByEmail(email)) {
    return NextResponse.json({ error: "exists", message: "You already have an account" }, { status: 409 });
  }
  if (calcAge(date_of_birth) < 16) {
    return NextResponse.json(
      { error: "too_young", message: "You need to be 16 or over to volunteer with Good Deeds." },
      { status: 403 },
    );
  }
  if (!terms_accepted) {
    return NextResponse.json(
      { error: "terms_required", message: "Please accept the Terms & Conditions." },
      { status: 400 },
    );
  }

  const user = await db.createUser({
    first_name,
    email,
    date_of_birth,
    postcode,
    indoor_outdoor,
    manual_pref,
    skills: Array.isArray(skills) ? skills.join("|") : skills || "",
    solo_group,
    terms_accepted_at: new Date().toISOString(),
  });

  return NextResponse.json({ user: await sanitiseUser(db, user) }, { status: 201 });
}
