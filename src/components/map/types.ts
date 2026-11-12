import type { DecoratedOpportunity } from "@/lib/server/services";

/** Props shared by the Google and Leaflet map implementations (sized by MapView's wrapper). */
export type MapImplProps = {
  opportunities: DecoratedOpportunity[];
  center: [number, number];
  interactive: boolean;
};

export const INTERACTIVE_ZOOM = 13;
export const STATIC_ZOOM = 14;
