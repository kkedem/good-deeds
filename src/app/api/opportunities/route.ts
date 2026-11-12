import { NextResponse } from "next/server";
import { createDb, isValidUkPostcode } from "@/lib/server/db";
import { decorateOpportunity, isUpcoming } from "@/lib/server/services";
import { isAllowedImageUrl } from "@/lib/server/images";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode");

  const db = createDb();
  const opportunities = (await db.getOpportunities()).filter((o) => o.status === "open" && isUpcoming(o));

  const decorated = (await Promise.all(opportunities.map((o) => decorateOpportunity(db, o, postcode)))).filter(
    (o) => o.spaces_left > 0,
  );

  if (decorated.every((o) => o.distance_miles !== null)) {
    decorated.sort((a, b) => (a.distance_miles as number) - (b.distance_miles as number));
  }

  return NextResponse.json({ opportunities: decorated });
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    poster_id,
    title,
    category,
    description,
    date,
    start_time,
    hours,
    postcode,
    lat,
    lng,
    indoor_outdoor,
    manual,
    online,
    type,
    capacity,
    skills,
    image_url,
  } = body;

  const db = createDb();
  const errors: Record<string, string> = {};
  if (!poster_id) errors.poster_id = "Missing poster";
  if (!title || title.length > 60) errors.title = "Title is required (max 60 characters)";
  if (!category) errors.category = "Category is required";
  if (!description || description.length > 500) errors.description = "Description is required (max 500 characters)";
  if (!date || !start_time) errors.date = "Date and start time are required";
  if (date && start_time && new Date(`${date}T${start_time}`) <= new Date()) {
    errors.date = "Date and time must be in the future";
  }
  const hoursNum = parseFloat(hours);
  if (!hours || Number.isNaN(hoursNum) || hoursNum < 0.5 || hoursNum > 8) {
    errors.hours = "Hours must be between 0.5 and 8";
  }
  let postcodeDistrictMatch = null;
  if (online !== true) {
    if (!postcode || !isValidUkPostcode(postcode)) {
      errors.postcode = "A valid Brighton & Hove postcode is required";
    } else {
      postcodeDistrictMatch = await db.findPostcodeCentroid(postcode);
      if (!postcodeDistrictMatch) {
        errors.postcode = "A valid Brighton & Hove postcode is required";
      }
    }
  }
  if (!indoor_outdoor) errors.indoor_outdoor = "Required";
  if (!manual) errors.manual = "Required";
  if (!type) errors.type = "Required";
  if (type === "group") {
    const cap = parseInt(capacity, 10);
    if (!capacity || Number.isNaN(cap) || cap < 2 || cap > 50) {
      errors.capacity = "Group capacity must be between 2 and 50";
    }
  }

  if (image_url && !isAllowedImageUrl(image_url)) errors.image_url = "Upload the photo again";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "validation", fields: errors }, { status: 400 });
  }

  let finalLat = lat;
  let finalLng = lng;
  if ((!finalLat || !finalLng) && postcode) {
    const centroid = await db.findPostcodeCentroid(postcode);
    if (centroid) {
      finalLat = centroid.lat;
      finalLng = centroid.lng;
    }
  }
  if (!finalLat || !finalLng) {
    const brighton = await db.findPostcodeCentroid("BN1 1AA");
    finalLat = brighton!.lat;
    finalLng = brighton!.lng;
  }

  const opportunity = await db.createOpportunity({
    poster_id,
    title,
    category,
    description,
    date,
    start_time,
    hours: hoursNum,
    postcode: postcode || "BN1 1AA",
    lat: finalLat,
    lng: finalLng,
    indoor_outdoor,
    manual,
    online: online ? "true" : "false",
    type,
    capacity,
    skills: Array.isArray(skills) ? skills.join("|") : skills || "",
    image_url: image_url || "",
  });

  return NextResponse.json({ opportunity: await decorateOpportunity(db, opportunity) }, { status: 201 });
}
