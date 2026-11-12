import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user_id } = await request.json();

  const db = createDb();
  const offer = await db.getOfferById(id);
  if (!offer) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const stats = await db.computeUserStats(user_id);
  const cost = parseInt(offer.points_cost, 10);
  if (stats.pointsBalance < cost) {
    return NextResponse.json(
      { error: "insufficient_points", message: `You need ${cost - stats.pointsBalance} more points` },
      { status: 400 },
    );
  }

  const voucherCode = `GD-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const redemption = await db.createRedemption({
    user_id,
    offer_id: offer.id,
    points_spent: cost,
    voucher_code: voucherCode,
  });
  return NextResponse.json({ redemption }, { status: 201 });
}
