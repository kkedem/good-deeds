import type { Db } from "./db";
import { distanceMiles, postcodeDistrict } from "./db";
import type { Row } from "./schema";

const BRIGHTON_FALLBACK_POSTCODE = "BN1 1AA";

export function calcAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export type SanitisedUser = {
  id: string;
  first_name: string;
  email: string;
  date_of_birth: string;
  postcode: string;
  postcode_district: string;
  indoor_outdoor: string;
  manual_pref: string;
  skills: string[];
  solo_group: string;
  id_verified: boolean;
  confirmed_hours: number;
  pending_hours: number;
  points_balance: number;
};

export async function sanitiseUser(db: Db, user: Row | null | undefined): Promise<SanitisedUser | null> {
  if (!user) return null;
  const stats = await db.computeUserStats(user.id);
  return {
    id: user.id,
    first_name: user.first_name,
    email: user.email,
    date_of_birth: user.date_of_birth,
    postcode: user.postcode,
    postcode_district: postcodeDistrict(user.postcode),
    indoor_outdoor: user.indoor_outdoor,
    manual_pref: user.manual_pref,
    skills: user.skills ? user.skills.split("|").filter(Boolean) : [],
    solo_group: user.solo_group,
    id_verified: user.id_verified === "true",
    confirmed_hours: stats.confirmedHours,
    pending_hours: stats.pendingHours,
    points_balance: stats.pointsBalance,
  };
}

export type DecoratedOpportunity = {
  id: string;
  poster_id: string;
  poster_name: string;
  title: string;
  category: string;
  description: string;
  date: string;
  start_time: string;
  hours: number;
  postcode: string;
  lat: number;
  lng: number;
  indoor_outdoor: string;
  manual: string;
  online: boolean;
  type: string;
  capacity: number;
  spaces_left: number;
  skills: string[];
  status: string;
  points_available: number;
  distance_miles: number | null;
};

export async function decorateOpportunity(
  db: Db,
  opp: Row,
  viewerPostcode?: string | null,
): Promise<DecoratedOpportunity> {
  const signups = await db.getSignupsByOpportunity(opp.id);
  const active = signups.filter((s) => s.status !== "cancelled");
  const spacesLeft = parseInt(opp.capacity, 10) - active.length;
  const poster = await db.getUserById(opp.poster_id);

  let distance: number | null = null;
  if (viewerPostcode) {
    const origin =
      (await db.findPostcodeCentroid(viewerPostcode)) ||
      (await db.findPostcodeCentroid(BRIGHTON_FALLBACK_POSTCODE));
    if (origin) {
      distance = Math.round(distanceMiles(origin.lat, origin.lng, parseFloat(opp.lat), parseFloat(opp.lng)) * 10) / 10;
    }
  }

  return {
    id: opp.id,
    poster_id: opp.poster_id,
    poster_name: poster ? poster.first_name : "Unknown",
    title: opp.title,
    category: opp.category,
    description: opp.description,
    date: opp.date,
    start_time: opp.start_time,
    hours: parseFloat(opp.hours),
    postcode: opp.postcode,
    lat: parseFloat(opp.lat),
    lng: parseFloat(opp.lng),
    indoor_outdoor: opp.indoor_outdoor,
    manual: opp.manual,
    online: opp.online === "true",
    type: opp.type,
    capacity: parseInt(opp.capacity, 10),
    spaces_left: spacesLeft,
    skills: opp.skills ? opp.skills.split("|").filter(Boolean) : [],
    status: opp.status,
    points_available: Math.round(parseFloat(opp.hours) * 10),
    distance_miles: distance,
  };
}

/** PRD gap fix: DATA never filtered out opportunities whose date/time has already passed. */
export function isUpcoming(opp: Row, now: Date = new Date()): boolean {
  if (!opp.date) return true;
  const start = new Date(`${opp.date}T${opp.start_time || "00:00"}`);
  return start.getTime() >= now.getTime();
}

/** PRD gap fix: find the centre to show on the map — user's postcode district, else Brighton. */
export async function findMapCentre(
  db: Db,
  userPostcode?: string | null,
): Promise<{ center: [number, number]; isFallback: boolean }> {
  if (userPostcode) {
    const centroid = await db.findPostcodeCentroid(userPostcode);
    if (centroid) return { center: [centroid.lat, centroid.lng], isFallback: false };
  }
  const brighton = await db.findPostcodeCentroid(BRIGHTON_FALLBACK_POSTCODE);
  return { center: brighton ? [brighton.lat, brighton.lng] : [50.8225, -0.1372], isFallback: true };
}

export { BRIGHTON_FALLBACK_POSTCODE };
