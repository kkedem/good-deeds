import { readTable, writeTable } from "./store";
import { nextId, type Row, type TableName } from "./schema";

export type UserRow = Row;
export type OpportunityRow = Row;
export type SignupRow = Row;

/**
 * One cache per request. Without this, decorating N opportunities means
 * 2N round trips to Redis (signups + poster lookups), which would blow past
 * the sub-1s target (NFR-01). Route handlers call createDb() once per request.
 */
export function createDb() {
  const cache = new Map<TableName, Row[]>();

  async function all(entity: TableName): Promise<Row[]> {
    if (!cache.has(entity)) {
      cache.set(entity, await readTable(entity));
    }
    return cache.get(entity)!;
  }

  // Read-modify-write races under concurrent writers are accepted here —
  // this is a single-presenter demo, not a production multi-writer system.
  async function save(entity: TableName, rows: Row[]): Promise<void> {
    cache.set(entity, rows);
    await writeTable(entity, rows);
  }

  async function findById(entity: TableName, id: string): Promise<Row | undefined> {
    return (await all(entity)).find((row) => row.id === id);
  }

  // ---- users ----
  async function getUsers() {
    return all("users");
  }

  async function getUserById(id: string) {
    return findById("users", id);
  }

  async function getUserByEmail(email: string) {
    const target = String(email).trim().toLowerCase();
    return (await getUsers()).find((u) => u.email.toLowerCase() === target);
  }

  async function createUser(data: {
    first_name: string;
    email: string;
    date_of_birth: string;
    postcode: string;
    indoor_outdoor?: string;
    manual_pref?: string;
    skills?: string;
    solo_group?: string;
    terms_accepted_at?: string;
  }) {
    const users = await getUsers();
    const user: Row = {
      id: nextId("u"),
      first_name: data.first_name,
      email: data.email,
      date_of_birth: data.date_of_birth,
      postcode: data.postcode,
      indoor_outdoor: data.indoor_outdoor || "either",
      manual_pref: data.manual_pref || "either",
      skills: data.skills || "",
      solo_group: data.solo_group || "either",
      terms_accepted_at: data.terms_accepted_at || "",
      id_verified: "false",
      created_at: new Date().toISOString(),
    };
    users.push(user);
    await save("users", users);
    return user;
  }

  async function updateUser(id: string, patch: Record<string, string>) {
    const users = await getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...patch };
    await save("users", users);
    return users[idx];
  }

  // ---- opportunities ----
  async function getOpportunities() {
    return all("opportunities");
  }

  async function getOpportunityById(id: string) {
    return findById("opportunities", id);
  }

  async function createOpportunity(data: {
    poster_id: string;
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
    online?: string;
    type: string;
    capacity?: string | number;
    skills?: string;
    image_url?: string;
  }) {
    const opportunities = await getOpportunities();
    const opportunity: Row = {
      id: nextId("o"),
      poster_id: data.poster_id,
      title: data.title,
      category: data.category,
      description: data.description,
      date: data.date,
      start_time: data.start_time,
      hours: String(data.hours),
      postcode: data.postcode,
      lat: String(data.lat),
      lng: String(data.lng),
      indoor_outdoor: data.indoor_outdoor,
      manual: data.manual,
      online: data.online || "false",
      type: data.type,
      capacity: String(data.type === "group" ? data.capacity : 1),
      skills: data.skills || "",
      status: "open",
      created_at: new Date().toISOString(),
      image_url: data.image_url || "",
    };
    opportunities.push(opportunity);
    await save("opportunities", opportunities);
    return opportunity;
  }

  async function updateOpportunity(id: string, patch: Record<string, string>) {
    const opportunities = await getOpportunities();
    const idx = opportunities.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    opportunities[idx] = { ...opportunities[idx], ...patch };
    await save("opportunities", opportunities);
    return opportunities[idx];
  }

  // ---- signups ----
  async function getSignups() {
    return all("signups");
  }

  async function getSignupsByOpportunity(opportunityId: string) {
    return (await getSignups()).filter((s) => s.opportunity_id === opportunityId);
  }

  async function getSignupsByUser(userId: string) {
    return (await getSignups()).filter((s) => s.user_id === userId);
  }

  async function createSignup(data: { opportunity_id: string; user_id: string; status?: string }) {
    const signups = await getSignups();
    const signup: Row = {
      id: nextId("s"),
      opportunity_id: data.opportunity_id,
      user_id: data.user_id,
      status: data.status || "joined",
      joined_at: new Date().toISOString(),
      done_at: "",
      confirmed_at: "",
      points_awarded: "0",
    };
    signups.push(signup);
    await save("signups", signups);
    return signup;
  }

  async function updateSignup(id: string, patch: Record<string, string>) {
    const signups = await getSignups();
    const idx = signups.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    signups[idx] = { ...signups[idx], ...patch };
    await save("signups", signups);
    return signups[idx];
  }

  // ---- businesses / offers / redemptions ----
  async function getBusinesses() {
    return all("businesses");
  }

  async function getBusinessById(id: string) {
    return findById("businesses", id);
  }

  async function getOffers() {
    return all("offers");
  }

  async function getOfferById(id: string) {
    return findById("offers", id);
  }

  async function getRedemptions() {
    return all("redemptions");
  }

  async function getRedemptionsByUser(userId: string) {
    return (await getRedemptions()).filter((r) => r.user_id === userId);
  }

  async function createRedemption(data: {
    user_id: string;
    offer_id: string;
    points_spent: number;
    voucher_code: string;
  }) {
    const redemptions = await getRedemptions();
    const redemption: Row = {
      id: nextId("r"),
      user_id: data.user_id,
      offer_id: data.offer_id,
      points_spent: String(data.points_spent),
      voucher_code: data.voucher_code,
      redeemed_at: new Date().toISOString(),
    };
    redemptions.push(redemption);
    await save("redemptions", redemptions);
    return redemption;
  }

  // ---- postcodes / categories ----
  async function getPostcodes() {
    return all("postcodes");
  }

  async function getCategories() {
    return all("categories");
  }

  // ---- derived stats ----
  async function computeUserStats(userId: string) {
    const signups = await getSignupsByUser(userId);
    const opportunities = await getOpportunities();
    let confirmedHours = 0;
    let pendingHours = 0;
    let pointsEarned = 0;

    signups.forEach((s) => {
      const opp = opportunities.find((o) => o.id === s.opportunity_id);
      const hours = opp ? parseFloat(opp.hours) : 0;
      if (s.status === "pending") pendingHours += hours;
      if (s.status === "confirmed") {
        confirmedHours += hours;
        pointsEarned += parseFloat(s.points_awarded || "0");
      }
    });

    const pointsSpent = (await getRedemptionsByUser(userId)).reduce(
      (sum, r) => sum + parseFloat(r.points_spent || "0"),
      0,
    );

    return {
      confirmedHours,
      pendingHours,
      pointsBalance: pointsEarned - pointsSpent,
    };
  }

  async function findPostcodeCentroid(postcode: string) {
    const district = postcodeDistrict(postcode);
    const match = (await getPostcodes()).find((p) => p.district.toUpperCase() === district);
    return match ? { lat: parseFloat(match.lat), lng: parseFloat(match.lng) } : null;
  }

  return {
    getUsers, getUserById, getUserByEmail, createUser, updateUser,
    getOpportunities, getOpportunityById, createOpportunity, updateOpportunity,
    getSignups, getSignupsByOpportunity, getSignupsByUser, createSignup, updateSignup,
    getBusinesses, getBusinessById, getOffers, getOfferById,
    getRedemptions, getRedemptionsByUser, createRedemption,
    getPostcodes, getCategories,
    computeUserStats, findPostcodeCentroid,
  };
}

export type Db = ReturnType<typeof createDb>;

// ---- postcode helpers (pure, no store access — safe to export directly) ----
const UK_POSTCODE_RE = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$/i;

export function isValidUkPostcode(postcode: string): boolean {
  return UK_POSTCODE_RE.test(String(postcode).trim());
}

export function normalisePostcode(postcode: string): string {
  return String(postcode).trim().toUpperCase().replace(/\s+/g, "");
}

export function postcodeDistrict(postcode: string): string {
  const compact = normalisePostcode(postcode);
  if (compact.length < 5) return compact;
  return compact.slice(0, -3);
}

export function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 3958.8; // miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
