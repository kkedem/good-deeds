"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { Api, type Offer } from "@/lib/client/api";
import { showToast } from "@/lib/client/format";
import { useSession } from "@/lib/client/session";

export default function RewardsPage() {
  const { user, refreshUser } = useSession();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [redeemTarget, setRedeemTarget] = useState<Offer | null>(null);
  const [voucher, setVoucher] = useState<{ code: string; title: string; business: string } | null>(null);

  useEffect(() => {
    refreshUser();
    Api.getOffers()
      .then((res) => setOffers(res.offers))
      .catch(() => showToast("Could not load rewards"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  async function handleConfirmRedeem() {
    if (!redeemTarget || !user) return;
    try {
      const { redemption } = await Api.redeem(redeemTarget.id, user.id);
      setVoucher({ code: redemption.voucher_code, title: redeemTarget.title, business: redeemTarget.business_name });
      setRedeemTarget(null);
      refreshUser();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Something went wrong");
      setRedeemTarget(null);
    }
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <h1>Rewards</h1>
        <span className="points-pill">✨ {user.points_balance} points</span>
      </div>
      <div id="offers-list">
        {offers.map((o) => {
          const affordable = user.points_balance >= o.points_cost;
          return (
            <div className="card offer-row" key={o.id}>
              <div>
                <div className="opp-title">{o.title}</div>
                <div className="opp-meta">
                  {o.business_name} · {o.business_area}
                </div>
                <div className="opp-meta">{o.points_cost} points</div>
              </div>
              {affordable ? (
                <button className="btn btn-primary btn-sm" onClick={() => setRedeemTarget(o)}>
                  Redeem
                </button>
              ) : (
                <button className="btn btn-sm" disabled style={{ background: "#eee", color: "#999" }}>
                  Need {o.points_cost - user.points_balance} more
                </button>
              )}
            </div>
          );
        })}
      </div>

      {redeemTarget && (
        <Modal onClose={() => setRedeemTarget(null)}>
          <h2>
            Spend {redeemTarget.points_cost} points on a {redeemTarget.title} at {redeemTarget.business_name}?
          </h2>
          <button className="btn btn-primary" onClick={handleConfirmRedeem}>
            Confirm
          </button>
          <button className="btn btn-ghost" onClick={() => setRedeemTarget(null)}>
            Cancel
          </button>
        </Modal>
      )}

      {voucher && (
        <Modal onClose={() => setVoucher(null)}>
          <div style={{ textAlign: "center" }}>
            <h2>{voucher.title}</h2>
            <p className="opp-meta">{voucher.business}</p>
            <div className="voucher-code">{voucher.code}</div>
            <p>Show this at the till</p>
            <button className="btn btn-primary" onClick={() => setVoucher(null)}>
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
