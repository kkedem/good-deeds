"use client";

import { useEffect, useState } from "react";
import { Gift, Hourglass, Lock, Store, Ticket } from "lucide-react";
import Modal from "@/components/Modal";
import { Api, type Offer } from "@/lib/client/api";
import { showToast } from "@/lib/client/format";
import { useSession } from "@/lib/client/session";
import "./rewards.css";

export default function RewardsPage() {
  const { user, refreshUser } = useSession();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [redeemTarget, setRedeemTarget] = useState<Offer | null>(null);
  const [voucher, setVoucher] = useState<{
    code: string;
    title: string;
    business: string;
    area: string;
    points: number;
  } | null>(null);

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
      setVoucher({
        code: redemption.voucher_code,
        title: redeemTarget.title,
        business: redeemTarget.business_name,
        area: redeemTarget.business_area,
        points: redeemTarget.points_cost,
      });
      setRedeemTarget(null);
      refreshUser();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Something went wrong");
      setRedeemTarget(null);
    }
  }

  const balance = user.points_balance;
  const pendingPoints = Math.round((user.pending_hours ?? 0) * 10);
  const confirmedHours = user.confirmed_hours ?? 0;
  const sortedOffers = [...offers].sort((a, b) => a.points_cost - b.points_cost);

  return (
    <div className="rewards-screen">
      <header className="rewards-header">
        <h1 className="rewards-title">Rewards</h1>
        <p className="rewards-sub">Spend points at independent Brighton &amp; Hove businesses.</p>
      </header>

      <section className="rewards-balance" aria-label="Your points balance">
        <p className="rewards-balance-eyebrow">Your points balance</p>
        <p className="rewards-balance-number">
          {balance} <span className="rewards-balance-unit">points</span>
        </p>
        <p className="rewards-balance-line">
          10 points for every confirmed hour · {confirmedHours} {confirmedHours === 1 ? "hour" : "hours"} confirmed
        </p>
        {pendingPoints > 0 && (
          <span className="rewards-balance-pending">
            <Hourglass size={14} aria-hidden="true" />
            {pendingPoints} points pending confirmation
          </span>
        )}
      </section>

      <h2 className="rewards-section-title">Local offers</h2>
      <ul className="rewards-offers" id="offers-list">
        {sortedOffers.map((o) => {
          const affordable = balance >= o.points_cost;
          return (
            <li className="rewards-offer" key={o.id}>
              <span className="rewards-offer-icon" aria-hidden="true">
                <Store size={22} />
              </span>
              <div className="rewards-offer-body">
                <p className="rewards-offer-title">{o.title}</p>
                <p className="rewards-offer-biz">
                  {o.business_name} · {o.business_area}
                </p>
                <p className="rewards-offer-cost">{o.points_cost} points</p>
              </div>
              {affordable ? (
                <button type="button" className="rewards-redeem-btn" onClick={() => setRedeemTarget(o)}>
                  Redeem
                </button>
              ) : (
                <span className="rewards-offer-locked">
                  <Lock size={16} aria-hidden="true" />
                  You need {o.points_cost - balance} more points
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <p className="rewards-footnote">All businesses and offers are fictional for this demo.</p>

      {redeemTarget && (
        <Modal onClose={() => setRedeemTarget(null)}>
          <h2 className="modal-title">
            Spend {redeemTarget.points_cost} points on a {redeemTarget.title} at {redeemTarget.business_name}?
          </h2>
          <p className="modal-text">You&apos;ll have {balance - redeemTarget.points_cost} points left.</p>
          <div className="modal-actions">
            <button type="button" className="cg-btn cg-btn--primary" onClick={handleConfirmRedeem}>
              Confirm
            </button>
            <button type="button" className="cg-btn cg-btn--ghost" onClick={() => setRedeemTarget(null)}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {voucher && (
        <Modal onClose={() => setVoucher(null)}>
          <div className="rewards-voucher">
            <div className="rewards-voucher-head">
              <Gift size={40} aria-hidden="true" />
              <h2 className="rewards-voucher-title">{voucher.title}</h2>
              <p className="rewards-voucher-biz">
                {voucher.business} · {voucher.area}
              </p>
            </div>
            <div className="rewards-voucher-body">
              <p className="rewards-voucher-eyebrow">Voucher code</p>
              <p className="rewards-voucher-code">{voucher.code}</p>
              <p className="rewards-voucher-till">
                <Ticket size={16} aria-hidden="true" /> Show this at the till
              </p>
              <span className="rewards-voucher-spent">{voucher.points} points spent</span>
            </div>
          </div>
          <p className="rewards-voucher-hint">You can find this code any time in Profile → My vouchers.</p>
          <div className="modal-actions">
            <button type="button" className="cg-btn cg-btn--primary" onClick={() => setVoucher(null)}>
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
