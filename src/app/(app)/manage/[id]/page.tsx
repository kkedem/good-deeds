"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { Api, type Attendee } from "@/lib/client/api";
import { categoryIcon, formatDate, showToast } from "@/lib/client/format";
import { shareOpportunity } from "@/lib/client/share";
import { useSession } from "@/lib/client/session";
import type { DecoratedOpportunity } from "@/lib/server/services";

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
      <div className="screen">
        <p>Couldn&apos;t load this opportunity.</p>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="screen">
        <p>Loading…</p>
      </div>
    );
  }

  if (opportunity.poster_id !== user.id) {
    return (
      <div className="screen">
        <p>You can only manage your own posts.</p>
        <button className="btn btn-secondary" onClick={() => router.push("/profile")}>
          Back to profile
        </button>
      </div>
    );
  }

  const isCompleted = opportunity.status === "completed";

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
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" aria-label="Back" onClick={() => router.push(`/opportunity/${opportunity.id}`)}>
          ←
        </button>
        <h1 style={{ flex: 1, textAlign: "center", fontSize: "1.1rem" }}>Manage</h1>
        <span style={{ width: 28 }}></span>
      </div>

      <div className="card">
        <div className="opp-title">
          {categoryIcon(opportunity.category)} {opportunity.title}
        </div>
        <p className="opp-meta">
          {formatDate(opportunity.date)} · {opportunity.hours} hrs · {isCompleted ? "Completed" : "Open"}
        </p>
      </div>

      <h2>Attendees ({attendees.length})</h2>
      <div className="card" id="attendee-list">
        {attendees.length ? (
          attendees.map((a) => (
            <div className="attendee-row" key={a.signup_id}>
              <label className="checkbox-row">
                <span>{a.name}</span>
              </label>
              <span className={`badge badge-${a.status}`}>{a.status}</span>
            </div>
          ))
        ) : (
          <p className="opp-meta">No one has joined yet.</p>
        )}
      </div>

      {!isCompleted ? (
        <>
          <button className="btn btn-primary" onClick={() => shareOpportunity(opportunity)}>
            Share this post
          </button>
          {attendees.length > 0 && (
            <button className="btn btn-accent" onClick={openModal}>
              Mark complete
            </button>
          )}
        </>
      ) : (
        <div className="empty-state">This opportunity is complete.</div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2>Confirm hours for everyone who took part?</h2>
          {attendees.map((a) => (
            <div className="attendee-row" key={a.signup_id}>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={checked.has(a.signup_id)}
                  onChange={() => toggleCheck(a.signup_id)}
                />
                <span>{a.name}</span>
              </label>
            </div>
          ))}
          <button className="btn btn-primary" onClick={handleConfirm}>
            Confirm
          </button>
          <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
            Cancel
          </button>
        </Modal>
      )}
    </div>
  );
}
