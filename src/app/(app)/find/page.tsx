"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MapView from "@/components/MapView";
import OpportunityCard from "@/components/OpportunityCard";
import { Api } from "@/lib/client/api";
import { categoryIcon, formatDate, showToast } from "@/lib/client/format";
import { takeUnseenConfirmation, useSession } from "@/lib/client/session";
import type { DecoratedOpportunity } from "@/lib/server/services";

const BRIGHTON_FALLBACK: [number, number] = [50.8225, -0.1372];

export default function FindPage() {
  const router = useRouter();
  const { user } = useSession();
  const [opportunities, setOpportunities] = useState<DecoratedOpportunity[]>([]);
  const [recommended, setRecommended] = useState<DecoratedOpportunity[]>([]);
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
        const { history } = await Api.getHistory(user.id);
        const celebration = takeUnseenConfirmation(history);
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

  return (
    <div className="screen">
      <div className="top-bar">
        <h1>Find a good deed</h1>
      </div>

      {!user && (
        <div className="demo-note">
          Browsing as a guest.{" "}
          <Link href={`/login?next=${encodeURIComponent("/find")}`}>Log in</Link> or{" "}
          <Link href="/signup">sign up</Link> to join a good deed.
        </div>
      )}

      {recommended.length > 0 && (
        <div id="recommended-wrap">
          <h2>Recommended for you</h2>
          <div className="recommended-strip">
            {recommended.map((o) => (
              <div
                key={o.id}
                className="recommended-card"
                onClick={() => router.push(`/opportunity/${o.id}`)}
              >
                <div className="opp-title">
                  {categoryIcon(o.category)} {o.title}
                </div>
                <div className="opp-meta">
                  {formatDate(o.date)} · {o.distance_miles != null ? `${o.distance_miles} mi` : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="toggle-row">
        <button className={view === "map" ? "active" : ""} onClick={() => setView("map")}>
          Map
        </button>
        <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
          List
        </button>
      </div>

      <div id="map-view" style={{ display: view === "map" ? "block" : "none" }}>
        <MapView opportunities={opportunities} center={center} />
      </div>

      <div id="list-view" style={{ display: view === "list" ? "block" : "none" }}>
        {loaded && opportunities.length === 0 && (
          <div className="empty-state">No good deeds found right now. Check back soon!</div>
        )}
        {opportunities.map((o) => (
          <OpportunityCard key={o.id} opportunity={o} />
        ))}
      </div>
    </div>
  );
}
