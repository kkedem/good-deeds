"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Hourglass,
  Share2,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Modal from "@/components/Modal";
import CategoryBadge from "@/components/CategoryBadge";
import { Api, type Attendee } from "@/lib/client/api";
import { formatDate, showToast } from "@/lib/client/format";
import { shareOpportunity } from "@/lib/client/share";
import { useSession } from "@/lib/client/session";
import type { DecoratedOpportunity } from "@/lib/server/services";
import "./manage.css";

const STATUS: Record<string, { label: string; tone: string; Icon: LucideIcon }> = {
  joined: { label: "Joined", tone: "joined", Icon: Check },
  pending: { label: "Pending confirmation", tone: "pending", Icon: Hourglass },
  confirmed: { label: "Confirmed", tone: "ok", Icon: CheckCircle2 },
  cancelled: { label: "Cancelled", tone: "cancelled", Icon: XCircle },
  completed: { label: "Completed", tone: "ok", Icon: CheckCircle2 },
  open: { label: "Open", tone: "open", Icon: Clock3 },
};

function StatusChip({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, tone: "cancelled", Icon: Clock3 };
  return (
    <span className={`manage-chip manage-chip--${s.tone}`}>
      <s.Icon size={14} aria-hidden="true" />
      {s.label}
    </span>
  );
}

export default function ManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useSession();
  const [opportunity, setOpportunity] = useState<DecoratedOpportunity | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [failed, setFailed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const res = await Api.getOpportunity(id, user.postcode);
        setOpportunity(res.opportunity);
        setAttendees(res.attendees.filter((a) => a.status !== "cancelled"));
      } catch {
        setFailed(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  if (!user) return null;

  if (failed) {
    return (
      <div className="manage-screen">
        <p className="manage-message">Couldn&apos;t load this opportunity.</p>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="manage-screen">
        <p className="manage-message">Loading…</p>
      </div>
    );
  }

  if (opportunity.poster_id !== user.id) {
    return (
      <div className="manage-screen">
        <p className="manage-message">You can only manage your own posts.</p>
        <button type="button" className="cg-btn cg-btn--secondary" onClick={() => router.push("/profile")}>
          Back to profile
        </button>
      </div>
    );
  }

  const isCompleted = opportunity.status === "completed";
  const confirmedCount = attendees.filter((a) => a.status === "confirmed").length;
  const hours = opportunity.hours;

  function openModal() {
    setChecked(new Set(attendees.map((a) => a.signup_id)));
    setShowModal(true);
  }

  function toggleCheck(signupId: string) {
    setChecked((c) => {
      const next = new Set(c);
      if (next.has(signupId)) next.delete(signupId);
      else next.add(signupId);
      return next;
    });
  }

  async function handleConfirm() {
    if (!opportunity) return;
    try {
      const { message } = await Api.completeOpportunity(opportunity.id, [...checked]);
      setShowModal(false);
      showToast(message);
      router.push("/profile");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="manage-screen">
      <div className="manage-topbar">
        <button
          type="button"
          className="manage-back"
          aria-label="Back"
          onClick={() => router.push(`/opportunity/${opportunity.id}`)}
        >
          <ChevronLeft size={24} />
        </button>
        <span className="manage-topbar-title">Manage</span>
        <span className="manage-topbar-spacer" aria-hidden="true" />
      </div>

      <header className="manage-header">
        <CategoryBadge category={opportunity.category} size={48} />
        <h1 className="manage-title">{opportunity.title}</h1>
        <p className="manage-meta">
          {formatDate(opportunity.date)}, {opportunity.start_time} · {hours} hrs
        </p>
        <StatusChip status={isCompleted ? "completed" : "open"} />
      </header>

      <section className="manage-section">
        <h2 className="manage-section-title">Who&apos;s coming ({attendees.length})</h2>
        {attendees.length ? (
          <ul className="manage-list" id="attendee-list">
            {attendees.map((a) => (
              <li className="manage-attendee" key={a.signup_id}>
                <span className="manage-avatar" aria-hidden="true">
                  {a.name.trim().charAt(0).toUpperCase()}
                </span>
                <span className="manage-attendee-name">{a.name}</span>
                <StatusChip status={a.status} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="manage-empty" id="attendee-list">
            No one has joined yet. Share your post to spread the word.
          </div>
        )}
      </section>

      <div className="manage-actions">
        {!isCompleted ? (
          <>
            <button
              type="button"
              className="cg-btn cg-btn--lg cg-btn--secondary"
              onClick={() => shareOpportunity(opportunity)}
            >
              <Share2 size={20} aria-hidden="true" /> Share this post
            </button>
            {attendees.length > 0 && (
              <button type="button" className="cg-btn cg-btn--lg cg-btn--primary" onClick={openModal}>
                <BadgeCheck size={20} aria-hidden="true" /> Mark complete
              </button>
            )}
          </>
        ) : (
          <div className="manage-banner" role="status">
            <CheckCircle2 size={20} aria-hidden="true" />
            <span>
              This opportunity is complete. {confirmedCount} {confirmedCount === 1 ? "volunteer" : "volunteers"}{" "}
              confirmed.
            </span>
          </div>
        )}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="modal-title">Confirm hours for everyone who took part?</h2>
          <p className="modal-text">
            Untick anyone who didn&apos;t come. Ticked people get {hours} {hours === 1 ? "hour" : "hours"} confirmed
            and {Math.round(hours * 10)} points. Unticked people get no hours or points.
          </p>
          <ul className="manage-check-list">
            {attendees.map((a) => {
              const isChecked = checked.has(a.signup_id);
              return (
                <li key={a.signup_id}>
                  <label className="manage-check-row">
                    <input
                      type="checkbox"
                      className="manage-check-input"
                      checked={isChecked}
                      onChange={() => toggleCheck(a.signup_id)}
                    />
                    <span className="manage-check-box" aria-hidden="true">
                      {isChecked && <Check size={16} strokeWidth={3} />}
                    </span>
                    <span className="manage-check-text">
                      <span className="manage-check-name">{a.name}</span>
                      <span
                        className={`manage-check-status${a.status === "pending" ? " manage-check-status--pending" : ""}`}
                      >
                        {a.status === "pending" ? "Said they've done it" : "Joined"}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="modal-actions">
            <button type="button" className="cg-btn cg-btn--lg cg-btn--primary" onClick={handleConfirm}>
              Confirm {checked.size} {checked.size === 1 ? "person" : "people"}
            </button>
            <button type="button" className="cg-btn cg-btn--ghost" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
          <p className="manage-warning">
            <AlertTriangle size={14} aria-hidden="true" /> This can&apos;t be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}
