export type TableName =
  | "users"
  | "opportunities"
  | "signups"
  | "businesses"
  | "offers"
  | "redemptions"
  | "postcodes"
  | "categories";

export type Row = Record<string, string>;

export const COLUMNS: Record<TableName, string[]> = {
  users: [
    "id", "first_name", "email", "date_of_birth", "postcode",
    "indoor_outdoor", "manual_pref", "skills", "solo_group",
    "terms_accepted_at", "id_verified", "created_at",
  ],
  opportunities: [
    "id", "poster_id", "title", "category", "description", "date", "start_time",
    "hours", "postcode", "lat", "lng", "indoor_outdoor", "manual", "online",
    "type", "capacity", "skills", "status", "created_at", "image_url",
  ],
  signups: [
    "id", "opportunity_id", "user_id", "status", "joined_at", "done_at",
    "confirmed_at", "points_awarded",
  ],
  businesses: ["id", "name", "area", "description"],
  offers: ["id", "business_id", "title", "points_cost"],
  redemptions: ["id", "user_id", "offer_id", "points_spent", "voucher_code", "redeemed_at"],
  postcodes: ["district", "lat", "lng"],
  categories: ["id", "name", "icon", "default_indoor_outdoor"],
};

export const TABLE_NAMES = Object.keys(COLUMNS) as TableName[];

export function nextId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}
