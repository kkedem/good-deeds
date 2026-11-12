"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import { categoryIcon, formatDate, showToast } from "@/lib/client/format";
import { INTERACTIVE_ZOOM, STATIC_ZOOM, type MapImplProps } from "./types";

/** OpenStreetMap/Leaflet map. Used when no Google Maps key is set, or Google fails to load. */
export default function LeafletMapView({ opportunities, center, interactive }: MapImplProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let map: import("leaflet").Map | null = null;
    let toastShown = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      map = L.map(containerRef.current, {
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: interactive,
      }).setView(center, interactive ? INTERACTIVE_ZOOM : STATIC_ZOOM);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      opportunities.forEach((o) => {
        const icon = L.divIcon({
          html: `<div class="pin-icon">${categoryIcon(o.category)}</div>`,
          className: "",
          iconSize: [28, 28],
        });
        const marker = L.marker([o.lat, o.lng], { icon }).addTo(map!);
        if (interactive) {
          const popupEl = document.createElement("div");
          popupEl.innerHTML = `
            <strong>${o.title}</strong><br/>
            ${formatDate(o.date)} ${o.start_time}<br/>
            ${o.distance_miles != null ? o.distance_miles + " mi · " : ""}${o.spaces_left} spaces left<br/>
          `;
          const btn = document.createElement("button");
          btn.textContent = "View";
          btn.style.cssText = "margin-top:6px;padding:6px 10px;border-radius:8px;border:none;background:#2f7157;color:#fff;";
          btn.addEventListener("click", () => router.push(`/opportunity/${o.id}`));
          popupEl.appendChild(btn);
          marker.bindPopup(popupEl);
        }
      });

      map.on("tileerror", () => {
        if (!toastShown) {
          toastShown = true;
          showToast("Map tiles failed to load — try the list view", 4000);
        }
      });
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunities, center, interactive]);

  return <div ref={containerRef} style={{ height: "100%" }} />;
}
