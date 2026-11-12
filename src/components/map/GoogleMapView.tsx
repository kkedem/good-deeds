"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  useAdvancedMarkerRef,
  useMap,
} from "@vis.gl/react-google-maps";
import { categoryIcon, formatDate } from "@/lib/client/format";
import type { DecoratedOpportunity } from "@/lib/server/services";
import { installAuthFailureHandler, markGoogleMapsFailed } from "./googleStatus";
import { INTERACTIVE_ZOOM, STATIC_ZOOM, type MapImplProps } from "./types";

// Common Ground palette
const INK = "#34332e";
const CREAM = "#f7f3e9";
const SIGNAL = "#f7c948";

// AdvancedMarker requires a map ID. DEMO_MAP_ID works for development; set
// NEXT_PUBLIC_GOOGLE_MAP_ID to a Cloud-styled map ID for production styling.
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "DEMO_MAP_ID";

// Must be installed before the Maps script loads so key rejections are caught.
installAuthFailureHandler();

type GoogleMapViewProps = MapImplProps & { apiKey: string };

export default function GoogleMapView({ apiKey, opportunities, center, interactive }: GoogleMapViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const handleError = useCallback(() => markGoogleMapsFailed(), []);

  const [lat, lng] = center;
  const selected = interactive ? (opportunities.find((o) => o.id === selectedId) ?? null) : null;

  return (
    <APIProvider apiKey={apiKey} onError={handleError}>
      <Map
        mapId={MAP_ID}
        defaultCenter={{ lat, lng }}
        defaultZoom={interactive ? INTERACTIVE_ZOOM : STATIC_ZOOM}
        style={{ width: "100%", height: "100%" }}
        clickableIcons={false}
        keyboardShortcuts={interactive}
        disableDefaultUI={!interactive}
        gestureHandling={interactive ? "cooperative" : "none"}
        zoomControl={interactive}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        cameraControl={false}
        onClick={() => setSelectedId(null)}
      >
        <Recenter lat={lat} lng={lng} />
        {opportunities.map((o) => (
          <OpportunityMarker
            key={o.id}
            opportunity={o}
            interactive={interactive}
            open={selected?.id === o.id}
            onSelect={() => setSelectedId(o.id)}
            onClose={() => setSelectedId(null)}
          />
        ))}
      </Map>
    </APIProvider>
  );
}

/** Pans the map when the `center` prop changes after mount. */
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map?.panTo({ lat, lng });
  }, [map, lat, lng]);
  return null;
}

type OpportunityMarkerProps = {
  opportunity: DecoratedOpportunity;
  interactive: boolean;
  open: boolean;
  onSelect: () => void;
  onClose: () => void;
};

function OpportunityMarker({ opportunity: o, interactive, open, onSelect, onClose }: OpportunityMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: o.lat, lng: o.lng }}
        title={o.title}
        clickable={interactive}
        onClick={interactive ? onSelect : undefined}
        anchorLeft="-50%"
        anchorTop="-50%"
        zIndex={open ? 10 : undefined}
      >
        <PinChip emoji={categoryIcon(o.category)} active={open} />
      </AdvancedMarker>
      {interactive && open && marker && (
        <InfoWindow anchor={marker} onClose={onClose} onCloseClick={onClose} headerContent={<strong>{o.title}</strong>}>
          <PopupContent opportunity={o} />
        </InfoWindow>
      )}
    </>
  );
}

function PinChip({ emoji, active }: { emoji: string; active: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        lineHeight: 1,
        background: active ? SIGNAL : CREAM,
        border: `2px solid ${INK}`,
        boxShadow: `0 0 0 3px ${active ? "rgba(247, 201, 72, 0.45)" : "rgba(247, 201, 72, 0.25)"}, 0 4px 10px rgba(52, 51, 46, 0.25)`,
        transform: active ? "scale(1.12)" : undefined,
        transition: "transform 150ms, background-color 150ms",
        boxSizing: "border-box",
      }}
    >
      {emoji}
    </div>
  );
}

function PopupContent({ opportunity: o }: { opportunity: DecoratedOpportunity }) {
  const router = useRouter();
  return (
    <div style={{ color: INK, fontSize: 14, lineHeight: 1.45 }}>
      <div>
        {formatDate(o.date)} {o.start_time}
      </div>
      <div>
        {o.distance_miles != null ? `${o.distance_miles} mi · ` : ""}
        {o.spaces_left} spaces left
      </div>
      <button
        type="button"
        onClick={() => router.push(`/opportunity/${o.id}`)}
        style={{
          marginTop: 8,
          padding: "7px 18px",
          borderRadius: 999,
          border: "none",
          background: SIGNAL,
          color: INK,
          fontWeight: 600,
          fontSize: 14,
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        View
      </button>
    </div>
  );
}
