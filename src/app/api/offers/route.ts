import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";

export async function GET() {
  const db = createDb();
  const offers = await Promise.all(
    (await db.getOffers()).map(async (o) => {
      const business = await db.getBusinessById(o.business_id);
      return {
        id: o.id,
        title: o.title,
        points_cost: parseInt(o.points_cost, 10),
        business_name: business ? business.name : "Unknown",
        business_area: business ? business.area : "",
      };
    }),
  );
  return NextResponse.json({ offers });
}
