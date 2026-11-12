"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MapView from "@/components/MapView";
import { Api, type Attendee } from "@/lib/client/api";
import { categoryIcon, categoryLabel, formatDate, showToast } from "@/lib/client/format";
import { downloadIcs } from "@/lib/client/ics";
import { shareOpportunity } from "@/lib/client/share";
import { useSession } from "@/lib/client/session";
import type { DecoratedOpportunity } from "@/lib/server/services";

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useSession();
  const [opportunity, setOpportunity] = useState<DecoratedOpportunity | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [failed, setFailed] = useState(false);

  async function load() {
    try {
      const res = await Api.getOpportunity(id, user?.postcode);
      setOpportunity(res.opportunity);
      setAttendees(res.attendees);
    } catch {
      setFailed(true);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await Api.getOpportunity(id, user?.postcode);
        setOpportunity(res.opportunity);
        setAttendees(res.attendees);
      } catch {
        setFailed(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  if (failed) {
    return (
      <div className="screen">
        <p>Couldn&apos;t load this opportunity.</p>
        <button className="btn btn-secondary" onClick={() => router.push("/find")}>
          Back to Find
        </button>
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

  const mySignup = user ? attendees.find((a) => a.user_id === user.id && a.status !== "cancelled") : undefined;
  const isPoster = user ? opportunity.poster_id === user.id : false;

  async function handleJoin() {
    if (!opportunity || !user) return;
    try {
      await Api.join(opportunity.id, user.id);
      showToast("You're going! ✓");
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function handleDone() {
    if (!mySignup) return;
    try {
      const { message } = await Api.markDone(mySignup.signup_id);
      showToast(message);
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function handleCancel() {
    if (!mySignup) return;
    try {
      await Api.cancelSignup(mySignup.signup_id);
      showToast("Your spot has been cancelled");
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" aria-label="Back" onClick={() => router.push("/find")}>
          ←
        </button>
        <h1 style={{ flex: 1, textAlign: "center", fontSize: "1.1rem" }}>{opportunity.title}</h1>
        <span style={{ width: 28 }}></span>
      </div>

      <div style={{ marginBottom: 14 }}>
        <MapView
          opportunities={[opportunity]}
          center={[opportunity.lat, opportunity.lng]}
          height={160}
          interactive={false}
        />
      </div>

      <div className="card">
        <div className="opp-tags" style={{ marginBottom: 10 }}>
          <span className="tag">
            {categoryIcon(opportunity.category)} {categoryLabel(opportunity.category)}
          </span>
          <span className="tag">{opportunity.indoor_outdoor}</span>
          <span className="tag">{opportunity.manual}</span>
          <span className="tag">{opportunity.online ? "Online" : "In person"}</span>
          <span className="tag">{opportunity.type === "group" ? "Group" : "Individual"}</span>
        </div>
        <p>{opportunity.description}</p>
        <p className="opp-meta">Posted by {opportunity.poster_name}</p>
        <p className="opp-meta">
          {formatDate(opportunity.date)} at {opportunity.start_time} · {opportunity.hours} hrs
        </p>
        <p className="opp-meta">
          {opportunity.online ? "Online" : opportunity.postcode}
          {opportunity.distance_miles != null ? ` · ${opportunity.distance_miles} mi away` : ""}
        </p>
        {opportunity.skills.length > 0 && <p className="opp-meta">Skills: {opportunity.skills.join(", ")}</p>}
        <p className="opp-meta">
          {opportunity.spaces_left} of {opportunity.capacity} spaces left
        </p>
        <span className="points-pill">✨ {opportunity.points_available} points available</span>
      </div>

      <div id="action-area">
        {!user ? (
          <>
            <Link
              href={`/login?next=${encodeURIComponent(`/opportunity/${id}`)}`}
              className="btn btn-primary"
              style={{ textDecoration: "none" }}
            >
              Log in to join
            </Link>
            <button className="btn btn-secondary" onClick={() => shareOpportunity(opportunity)}>
              Share
            </button>
          </>
        ) : isPoster ? (
          <>
            <button className="btn btn-primary" onClick={() => router.push(`/manage/${opportunity.id}`)}>
              Manage
            </button>
            <button className="btn btn-secondary" onClick={() => shareOpportunity(opportunity)}>
              Share
            </button>
          </>
        ) : opportunity.status === "completed" ? (
          <div className="empty-state">This opportunity has been completed.</div>
        ) : mySignup ? (
          mySignup.status === "joined" ? (
            <>
              <div className="badge badge-joined" style={{ marginBottom: 12 }}>
                You&apos;re going ✓
              </div>
              <button className="btn btn-primary" onClick={handleDone}>
                I&apos;ve done it
              </button>
              <button className="btn btn-secondary" onClick={() => downloadIcs(opportunity)}>
                Add to calendar
              </button>
              <button className="btn btn-secondary" onClick={() => shareOpportunity(opportunity)}>
                Share
              </button>
              <button className="btn btn-ghost" onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : mySignup.status === "pending" ? (
            <>
              <div className="badge badge-pending" style={{ marginBottom: 12 }}>
                Pending confirmation
              </div>
              <p className="opp-meta">Waiting for the organiser to confirm your hours.</p>
              <button className="btn btn-secondary" onClick={() => downloadIcs(opportunity)}>
                Add to calendar
              </button>
              <button className="btn btn-secondary" onClick={() => shareOpportunity(opportunity)}>
                Share
              </button>
            </>
          ) : mySignup.status === "confirmed" ? (
            <>
              <div className="badge badge-confirmed" style={{ marginBottom: 12 }}>
                Confirmed ✓
              </div>
              <p className="opp-meta">+{Math.round(opportunity.hours * 10)} points earned</p>
              <button className="btn btn-secondary" onClick={() => shareOpportunity(opportunity)}>
                Share
              </button>
            </>
          ) : null
        ) : opportunity.spaces_left <= 0 ? (
          <div className="empty-state">This opportunity is full</div>
        ) : (
          <>
            <button className="btn btn-primary" onClick={handleJoin}>
              Join
            </button>
            <button className="btn btn-secondary" onClick={() => shareOpportunity(opportunity)}>
              Share
            </button>
          </>
        )}
      </div>
    </div>
  );
}
