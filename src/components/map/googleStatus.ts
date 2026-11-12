/**
 * Page-lifetime record of whether Google Maps has failed. The Maps JS API is a
 * singleton script, so once it fails (bad key, referrer not allowed, API not
 * enabled, billing off) every later map on the page should go straight to the
 * Leaflet fallback rather than retrying.
 */

import { showToast } from "@/lib/client/format";

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

let failed = false;
const listeners = new Set<() => void>();

export function hasGoogleMapsFailed(): boolean {
  return failed;
}

export function markGoogleMapsFailed(): void {
  if (failed) return;
  failed = true;
  showToast("Google Maps failed to load — showing the basic map instead", 4000);
  listeners.forEach((fn) => fn());
}

/** Subscribe signature compatible with React's useSyncExternalStore. */
export function onGoogleMapsFailure(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

let authHandlerInstalled = false;

/**
 * Google calls the global `gm_authFailure` when the key is rejected. Install it
 * before the script loads so we can swap to Leaflet. Chains any existing handler.
 */
export function installAuthFailureHandler(): void {
  if (authHandlerInstalled || typeof window === "undefined") return;
  authHandlerInstalled = true;
  const previous = window.gm_authFailure;
  window.gm_authFailure = () => {
    previous?.();
    markGoogleMapsFailed();
  };
}
