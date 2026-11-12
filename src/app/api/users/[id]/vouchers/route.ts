import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createDb();
  const redemptions = await db.getRedemptionsByUser(id);

  const vouchers = await Promise.all(
    redemptions.map(async (r) => {
      const offer = await db.getOfferById(r.offer_id);
      const business = offer ? await db.getBusinessById(offer.business_id) : null;
      return {
        code: r.voucher_code,
        offer_title: offer ? offer.title : "Unknown offer",
        business_name: business ? business.name : "",
        redeemed_at: r.redeemed_at,
      };
    }),
  );

  return NextResponse.json({ vouchers });
}
