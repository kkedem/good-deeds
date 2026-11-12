"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  CircleCheck,
  CircleX,
  Clock,
  Gift,
  Hand,
  Hourglass,
  House,
  LogIn,
  MapPin,
  Settings2,
  Share2,
  ShieldCheck,
  Sun,
  User,
  Users,
  Wifi,
  Wrench,
} from "lucide-react";
import MapView from "@/components/MapView";
import OpportunityImage from "@/components/OpportunityImage";
import { Api, type Attendee } from "@/lib/client/api";
import { categoryLabel, formatDate, showToast } from "@/lib/client/format";
import { downloadIcs } from "@/lib/client/ics";
import { shareOpportunity } from "@/lib/client/share";
import { useSession } from "@/lib/client/session";
import type { DecoratedOpportunity } from "@/lib/server/services";
import "./detail.css";

function fmtHours(h: number) {
  return `${h} ${h === 1 ? "hour" : "hours"}`;
}

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
      <div className="detail-screen">
        <div className="detail-state">
          <p>Couldn&apos;t load this opportunity.</p>
          <button className="cg-btn cg-btn--secondary" onClick={() => router.push("/find")}>
            Back to Find
          </button>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="detail-screen">
        <p className="detail-state">Loading…</p>
      </div>
    );
  }

  const mySignup = user ? attendees.find((a) => a.user_id === user.id && a.status !== "cancelled") : undefined;
  const isPoster = user ? opportunity.poster_id === user.id : false;
  const outdoor = opportunity.indoor_outdoor === "outdoor";
  const manual = opportunity.manual === "manual";
  const group = opportunity.type === "group";
  const poster = opportunity.poster_name;

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

  const share = () => shareOpportunity(opportunity);

  const statusBadge =
    mySignup?.status === "joined" ? (
      <span className="detail-status detail-status--joined">
        <CircleCheck size={14} /> You&apos;re going
      </span>
    ) : mySignup?.status === "pending" ? (
      <span className="detail-status detail-status--pending">
        <Hourglass size={14} /> Pending confirmation
      </span>
    ) : mySignup?.status === "confirmed" ? (
      <span className="detail-status detail-status--confirmed">
        <BadgeCheck size={14} /> Confirmed
      </span>
    ) : opportunity.status === "completed" ? (
      <span className="detail-status detail-status--completed">
        <BadgeCheck size={14} /> This good deed has finished
      </span>
    ) : null;

  return (
    <div className="detail-screen">
      <div className="detail-hero">
        <div className="detail-hero-photo">
          <OpportunityImage src={opportunity.image_url} sizes="(max-width: 480px) 100vw, 480px" priority />
          <div className="detail-hero-scrim" aria-hidden="true" />
        </div>
        <div className="detail-hero-bar">
          <button type="button" className="detail-glass-btn" aria-label="Back" onClick={() => router.push("/find")}>
            <ChevronLeft size={22} />
          </button>
          <button type="button" className="detail-glass-btn" aria-label="Share this good deed" onClick={share}>
            <Share2 size={20} />
          </button>
        </div>
        <div className="detail-hero-tags">
          <span className="detail-tag detail-tag--signal">{categoryLabel(opportunity.category)}</span>
          {opportunity.online && (
            <span className="detail-tag detail-tag--white">
              <Wifi size={14} /> Online
            </span>
          )}
        </div>
      </div>

      <div className="detail-summary">
        {statusBadge}
        <h1 className="detail-title">{opportunity.title}</h1>
        <p className="detail-byline">
          Posted by <strong>{poster}</strong>
          {!opportunity.online && ` · ${opportunity.postcode}`}
        </p>

        <div className="detail-facts">
          <div className="detail-fact">
            <CalendarDays size={20} aria-hidden="true" />
            <p className="detail-fact-label">Date</p>
            <p className="detail-fact-value">{formatDate(opportunity.date)}</p>
          </div>
          <div className="detail-fact">
            <Clock size={20} aria-hidden="true" />
            <p className="detail-fact-label">Time</p>
            <p className="detail-fact-value">
              {opportunity.start_time} · {fmtHours(opportunity.hours)}
            </p>
          </div>
          <div className="detail-fact">
            {group ? <Users size={20} aria-hidden="true" /> : <User size={20} aria-hidden="true" />}
            <p className="detail-fact-label">{group ? "Group" : "Individual"}</p>
            <p className="detail-fact-value">
              {opportunity.status === "completed"
                ? "Closed"
                : `${opportunity.spaces_left} of ${opportunity.capacity} spaces left`}
            </p>
          </div>
          <div className="detail-fact">
            <Gift size={20} aria-hidden="true" />
            <p className="detail-fact-label">Points available</p>
            <p className="detail-fact-value">{opportunity.points_available} points</p>
          </div>
        </div>
        <p className="detail-note">One-off good deed. No ongoing commitment.</p>
      </div>

      <section className="detail-block" aria-labelledby="about-h">
        <h2 id="about-h" className="detail-block-title">
          About
        </h2>
        <p className="detail-body">{opportunity.description}</p>
        <div className="detail-tags">
          <span className="detail-tag detail-tag--line">
            {outdoor ? <Sun size={14} /> : <House size={14} />} {outdoor ? "Outdoor" : "Indoor"}
          </span>
          <span className="detail-tag detail-tag--line">
            <Hand size={14} /> {manual ? "Hands-on" : "Non-manual"}
          </span>
          <span className="detail-tag detail-tag--line">
            {group ? <Users size={14} /> : <User size={14} />} {group ? "Group" : "Individual"}
          </span>
          <span className="detail-tag detail-tag--line">
            {opportunity.online ? <Wifi size={14} /> : <MapPin size={14} />}{" "}
            {opportunity.online ? "Online" : "In person"}
          </span>
        </div>
      </section>

      <section className="detail-block" aria-labelledby="where-h">
        <h2 id="where-h" className="detail-block-title">
          Where to go
        </h2>
        {!opportunity.online && (
          <div className="detail-where-map">
            <MapView
              opportunities={[opportunity]}
              center={[opportunity.lat, opportunity.lng]}
              height={180}
              interactive={false}
            />
          </div>
        )}
        <div className="detail-card">
          <p className="detail-card-title">{opportunity.online ? "Online" : opportunity.postcode}</p>
          {opportunity.distance_miles != null && !opportunity.online && (
            <p className="detail-card-util">{opportunity.distance_miles} miles from you</p>
          )}
          {opportunity.online && <p className="detail-card-sub">Join from anywhere. The organiser will send details.</p>}
        </div>
      </section>

      <section className="detail-block" aria-labelledby="before-h">
        <h2 id="before-h" className="detail-block-title">
          Before you join
        </h2>
        <div className="detail-rows">
          <div className="detail-row">
            <span className="detail-row-icon" aria-hidden="true">
              <Wrench size={18} />
            </span>
            <div>
              <p className="detail-row-label">Skills needed</p>
              <p className="detail-row-value">
                {opportunity.skills.length ? opportunity.skills.join(", ") : "None – everyone’s welcome"}
              </p>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-row-icon" aria-hidden="true">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="detail-row-label">Who can take part</p>
              <p className="detail-row-value">
                Anyone aged 16 or over with a Good Deeds account. No background check needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="detail-block" aria-labelledby="next-h">
        <h2 id="next-h" className="detail-block-title">
          What happens next
        </h2>
        <ol className="detail-steps">
          {[
            ["Join in one tap", "Your space is held straight away – no application or approval."],
            [
              "Turn up on the day",
              `Meet ${poster} at ${opportunity.start_time}. Add it to your calendar so you don’t forget.`,
            ],
            ["Tap “I’ve done it”", `Afterwards, log your ${fmtHours(opportunity.hours)}. They show as pending.`],
            [
              "The organiser confirms",
              `Once ${poster} marks it complete, your hours are confirmed and you get ${opportunity.points_available} points.`,
            ],
          ].map(([t, b], i) => (
            <li key={t} className="detail-step">
              <span className="detail-step-num" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <p className="detail-step-title">{t}</p>
                <p className="detail-step-body">{b}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="detail-callout">
          <strong>Plans changed?</strong> You can cancel any time before the organiser marks it complete. Your space
          goes to someone else – there’s no penalty.
        </p>
      </section>

      <section className="detail-block" aria-labelledby="org-h">
        <h2 id="org-h" className="detail-block-title">
          Organiser
        </h2>
        <div className="detail-card detail-organiser">
          <span className="detail-avatar" aria-hidden="true">
            {poster[0]}
          </span>
          <div>
            <p className="detail-organiser-name">{poster}</p>
            <p className="detail-card-util">Community organiser</p>
          </div>
        </div>
      </section>

      <div className="detail-action-bar" id="action-area">
        {!user ? (
          <div className="detail-action-row">
            <div className="detail-action-when">
              <p className="detail-action-when-main">
                {formatDate(opportunity.date)}, {opportunity.start_time}
              </p>
              <p className="detail-action-when-sub">
                {fmtHours(opportunity.hours)} · {opportunity.points_available} points
              </p>
            </div>
            <Link
              href={`/login?next=${encodeURIComponent(`/opportunity/${id}`)}`}
              className="cg-btn cg-btn--primary cg-btn--lg"
            >
              <LogIn size={18} aria-hidden="true" /> Log in to join
            </Link>
          </div>
        ) : isPoster ? (
          <div className="detail-action-grid">
            <button className="cg-btn cg-btn--primary" onClick={() => router.push(`/manage/${opportunity.id}`)}>
              <Settings2 size={18} aria-hidden="true" /> Manage
            </button>
            <button className="cg-btn cg-btn--secondary" onClick={share}>
              <Share2 size={18} aria-hidden="true" /> Share
            </button>
          </div>
        ) : opportunity.status === "completed" ? (
          <p className="detail-action-closed">This opportunity has been completed.</p>
        ) : mySignup ? (
          mySignup.status === "joined" ? (
            <>
              <div className="detail-action-row">
                <p className="detail-action-status" role="status">
                  <CircleCheck size={20} color="var(--cg-ok)" aria-hidden="true" /> You&apos;re going ✓
                </p>
                <button className="cg-btn cg-btn--primary cg-btn--sm detail-btn-auto" onClick={handleDone}>
                  I&apos;ve done it
                </button>
              </div>
              <div className="detail-action-grid">
                <button className="cg-btn cg-btn--secondary cg-btn--sm" onClick={() => downloadIcs(opportunity)}>
                  <CalendarPlus size={16} aria-hidden="true" /> Add to calendar
                </button>
                <button className="cg-btn cg-btn--secondary cg-btn--sm" onClick={share}>
                  <Share2 size={16} aria-hidden="true" /> Share
                </button>
              </div>
              <button className="cg-btn cg-btn--ghost cg-btn--sm" style={{ marginTop: 4 }} onClick={handleCancel}>
                <CircleX size={16} aria-hidden="true" /> Cancel
              </button>
            </>
          ) : mySignup.status === "pending" ? (
            <>
              <div className="detail-action-pending" role="status">
                <Hourglass size={24} aria-hidden="true" />
                <p>
                  <strong>Pending confirmation.</strong> Waiting for the organiser to confirm your hours.
                </p>
              </div>
              <div className="detail-action-grid">
                <button className="cg-btn cg-btn--secondary cg-btn--sm" onClick={() => downloadIcs(opportunity)}>
                  <CalendarPlus size={16} aria-hidden="true" /> Add to calendar
                </button>
                <button className="cg-btn cg-btn--secondary cg-btn--sm" onClick={share}>
                  <Share2 size={16} aria-hidden="true" /> Share
                </button>
              </div>
            </>
          ) : mySignup.status === "confirmed" ? (
            <div className="detail-action-row">
              <p className="detail-action-status detail-action-status--ok">
                <BadgeCheck size={20} aria-hidden="true" /> Confirmed ✓ · +{Math.round(opportunity.hours * 10)} points
                earned
              </p>
              <button className="cg-btn cg-btn--secondary cg-btn--sm detail-btn-auto" onClick={share}>
                <Share2 size={16} aria-hidden="true" /> Share
              </button>
            </div>
          ) : null
        ) : opportunity.spaces_left <= 0 ? (
          <p className="detail-action-closed" role="status">
            This opportunity is full
          </p>
        ) : (
          <div className="detail-action-row">
            <div className="detail-action-when">
              <p className="detail-action-when-main">
                {formatDate(opportunity.date)}, {opportunity.start_time}
              </p>
              <p className="detail-action-when-sub">
                {fmtHours(opportunity.hours)} · {opportunity.points_available} points
              </p>
            </div>
            <button className="cg-btn cg-btn--primary cg-btn--lg" onClick={handleJoin}>
              Join
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
