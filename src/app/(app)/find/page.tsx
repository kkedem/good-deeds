"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  Clock,
  List as ListIcon,
  Map as MapIcon,
  MapPin,
  SearchX,
  Sparkles,
  Users,
} from "lucide-react";
import MapView from "@/components/MapView";
import CategoryBadge from "@/components/CategoryBadge";
import { Api, type HistoryEntry } from "@/lib/client/api";
import { categoryLabel, formatDate, showToast } from "@/lib/client/format";
import { takeUnseenConfirmation, useSession } from "@/lib/client/session";
import type { DecoratedOpportunity } from "@/lib/server/services";

const BRIGHTON_FALLBACK: [number, number] = [50.8225, -0.1372];

function nextUp(history: HistoryEntry[]) {
  const today = new Date().toISOString().slice(0, 10);
  return history
    .filter((h) => h.status === "joined" && h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

export default function FindPage() {
  const router = useRouter();
  const { user } = useSession();
  const [opportunities, setOpportunities] = useState<DecoratedOpportunity[]>([]);
  const [recommended, setRecommended] = useState<DecoratedOpportunity[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [view, setView] = useState<"map" | "list">("map");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await Api.getOpportunities(user?.postcode);
        setOpportunities(res.opportunities);
      } catch {
        showToast("Could not load opportunities");
      } finally {
        setLoaded(true);
      }

      if (!user) return;

      try {
        const { opportunities: rec } = await Api.getRecommended(user.id);
        setRecommended(rec);
      } catch {
        setRecommended([]);
      }

      try {
        const { history: h } = await Api.getHistory(user.id);
        setHistory(h);
        const celebration = takeUnseenConfirmation(h);
        if (celebration) {
          showToast(`+${celebration.points} points — confirmed 🎉`, 4000);
        }
      } catch {
        // demo: ignore
      }
    })();
  }, [user]);

  const center: [number, number] = opportunities.length
    ? [opportunities[0].lat, opportunities[0].lng]
    : BRIGHTON_FALLBACK;

  const next = nextUp(history);

  return (
    <div className="find-screen">
      <div className="find-header-row">
        <div className="landing-wordmark" style={{ padding: 0 }}>
          <span className="landing-wordmark-icon" aria-hidden="true">
            <Sparkles size={16} fill="currentColor" />
          </span>
          Good Deeds
        </div>
        <button className="find-bell" aria-label="Updates" type="button">
          <Bell size={20} />
        </button>
      </div>

      <h1 className="find-headline">
        {user ? `Hi ${user.first_name}, ready for a good deed?` : "Good deeds near you"}
      </h1>
      <p className="find-location">
        <MapPin size={16} aria-hidden="true" />
        {user ? user.postcode_district : "Brighton city centre"}
      </p>

      <div className="find-stack">
        {!user && (
          <div className="find-banner">
            <Sparkles size={18} />
            <span>
              You&apos;re looking around as a guest. <Link href="/signup">Sign up</Link> to join, save and get
              recommendations.
            </span>
          </div>
        )}

        {next && (
          <button
            type="button"
            className="find-next-card"
            onClick={() => router.push(`/opportunity/${next.opportunity_id}`)}
          >
            <CalendarCheck size={24} />
            <span className="find-next-card-body">
              <span className="find-next-card-eyebrow">Your next good deed</span>
              <span className="find-next-card-title">{next.title}</span>
              <span className="find-next-card-meta">{formatDate(next.date)}</span>
            </span>
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {recommended.length > 0 && (
        <section className="find-section">
          <div className="find-section-head">
            <h2 className="find-section-title">Recommended for you</h2>
          </div>
          <div className="find-recommended-strip">
            {recommended.map((o) => (
              <button
                key={o.id}
                type="button"
                className="find-feature-card"
                onClick={() => router.push(`/opportunity/${o.id}`)}
              >
                <div className="find-feature-card-top">
                  <CategoryBadge category={o.category} size={44} />
                </div>
                <div className="find-feature-card-body">
                  <h3 className="find-feature-card-title">{o.title}</h3>
                  <p className="find-feature-card-meta">
                    {formatDate(o.date)}
                    {o.distance_miles != null ? ` · ${o.distance_miles} mi` : ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="find-section">
        <div className="find-section-head">
          <h2 className="find-section-title">All good deeds nearby</h2>
        </div>
        <div className="find-segmented" role="radiogroup" aria-label="View as">
          <button
            type="button"
            role="radio"
            aria-checked={view === "list"}
            className={view === "list" ? "active" : ""}
            onClick={() => setView("list")}
          >
            <ListIcon size={16} /> List
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={view === "map"}
            className={view === "map" ? "active" : ""}
            onClick={() => setView("map")}
          >
            <MapIcon size={16} /> Map
          </button>
        </div>

        <p className="find-results-count" role="status" aria-live="polite">
          {loaded
            ? `${opportunities.length} ${opportunities.length === 1 ? "good deed" : "good deeds"}${
                view === "list" ? " · nearest first" : ""
              }`
            : "Finding good deeds near you…"}
        </p>

        {loaded && opportunities.length === 0 ? (
          <div className="find-empty">
            <span className="find-empty-icon">
              <SearchX size={28} />
            </span>
            <h3>No good deeds nearby</h3>
            <p>Check back soon — new good deeds are posted all the time.</p>
          </div>
        ) : view === "map" ? (
          <div className="find-map-wrap" id="map-view">
            <MapView opportunities={opportunities} center={center} />
          </div>
        ) : (
          <ul className="find-list">
            {opportunities.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  className="find-card"
                  onClick={() => router.push(`/opportunity/${o.id}`)}
                >
                  <span className="find-card-icon">
                    <CategoryBadge category={o.category} size={40} />
                  </span>
                  <span className="find-card-body">
                    <span className="find-card-category">{categoryLabel(o.category)}</span>
                    <span className="find-card-title">{o.title}</span>
                    <span className="find-card-meta">
                      <span className="find-card-tag">
                        <CalendarDays size={14} /> {formatDate(o.date)}, {o.start_time}
                      </span>
                      <span className="find-card-tag">
                        <Clock size={14} /> {o.hours}h
                      </span>
                      {o.distance_miles != null && (
                        <span className="find-card-tag">
                          <MapPin size={14} /> {o.distance_miles} mi
                        </span>
                      )}
                    </span>
                    <span className="find-card-footer">
                      <span className={`find-status-chip find-status-chip--${o.spaces_left <= 0 ? "full" : "open"}`}>
                        <Users size={12} />
                        {o.spaces_left <= 0 ? "Full" : `${o.spaces_left} of ${o.capacity} left`}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
