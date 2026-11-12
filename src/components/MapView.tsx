"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import type { DecoratedOpportunity } from "@/lib/server/services";
import { hasGoogleMapsFailed, onGoogleMapsFailure } from "./map/googleStatus";

type MapViewProps = {
  opportunities: DecoratedOpportunity[];
  center: [number, number];
  height?: number;
  interactive?: boolean;
};

// Both implementations are client-only and code-split, so the Google bundle is
// never downloaded when no key is configured (and vice versa for Leaflet).
const GoogleMapView = dynamic(() => import("./map/GoogleMapView"), { ssr: false });
const LeafletMapView = dynamic(() => import("./map/LeafletMapView"), { ssr: false });

// Inlined at build time. Empty/missing => Leaflet + OpenStreetMap fallback.
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export default function MapView({ opportunities, center, height = 320, interactive = true }: MapViewProps) {
  // Flips to true (page-wide) if the Google script errors or the key is rejected.
  const googleFailed = useSyncExternalStore(onGoogleMapsFailure, hasGoogleMapsFailed, () => false);
  const useGoogle = GOOGLE_MAPS_API_KEY !== "" && !googleFailed;

  return (
    // isolate keeps the map's high z-index panes from painting over the bottom nav
    <div style={{ height, borderRadius: 14, overflow: "hidden", isolation: "isolate" }}>
      {useGoogle ? (
        <GoogleMapView
          apiKey={GOOGLE_MAPS_API_KEY}
          opportunities={opportunities}
          center={center}
          interactive={interactive}
        />
      ) : (
        <LeafletMapView opportunities={opportunities} center={center} interactive={interactive} />
      )}
    </div>
  );
}
