// Non-destructive data top-up for an existing store (Redis on Vercel, or data/*.csv locally).
// Unlike `npm run reset`, this keeps everything users have created. Safe to run repeatedly.
//
//   1. Opportunities: copy image_url from seed onto matching rows that lack one; add missing seed rows.
//   2. Signups: add missing seed signups (the past, confirmed deeds that award starting points).
//   3. Every user (including ones who signed up live) is topped up to at least MIN_POINTS by
//      confirming them on past completed deeds, so balances stay derived from real signups.
//
// Usage: node scripts/migrate.mjs [--dry-run]
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

const MIN_POINTS = 50;
const DRY_RUN = process.argv.includes("--dry-run");
const DATA_DIR = path.join(process.cwd(), "data");
const SEED_DIR = path.join(DATA_DIR, "seed");

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new (await import("@upstash/redis")).Redis({ url, token }) : null;

function readCsv(file) {
  if (!fs.existsSync(file)) return [];
  const content = fs.readFileSync(file, "utf8");
  return content.trim() ? parse(content, { columns: true, skip_empty_lines: true }) : [];
}

const seed = (name) => readCsv(path.join(SEED_DIR, `${name}.csv`));

async function load(name) {
  if (redis) return (await redis.get(`gd:table:${name}`)) ?? seed(name);
  const file = path.join(DATA_DIR, `${name}.csv`);
  return fs.existsSync(file) ? readCsv(file) : seed(name);
}

async function save(name, rows, columns) {
  if (DRY_RUN) return;
  if (redis) await redis.set(`gd:table:${name}`, rows);
  else fs.writeFileSync(path.join(DATA_DIR, `${name}.csv`), stringify(rows, { header: true, columns }));
}

const columnsOf = (name) => Object.keys(seed(name)[0]);

const opportunities = await load("opportunities");
const signups = await load("signups");
const users = await load("users");
const redemptions = await load("redemptions");

// 1. Opportunities
let imagesAdded = 0;
let oppsAdded = 0;
for (const s of seed("opportunities")) {
  const existing = opportunities.find((o) => o.id === s.id);
  if (!existing) {
    opportunities.push(s);
    oppsAdded++;
  } else if (!existing.image_url && s.image_url) {
    existing.image_url = s.image_url;
    imagesAdded++;
  }
}

// 2. Seed signups
let signupsAdded = 0;
for (const s of seed("signups")) {
  if (!signups.some((x) => x.id === s.id)) {
    signups.push(s);
    signupsAdded++;
  }
}

// 3. Top every user up to MIN_POINTS
const pastDeeds = opportunities
  .filter((o) => o.status === "completed")
  .sort((a, b) => parseFloat(b.hours) - parseFloat(a.hours));

function balance(userId) {
  const earned = signups
    .filter((s) => s.user_id === userId && s.status === "confirmed")
    .reduce((sum, s) => sum + parseFloat(s.points_awarded || "0"), 0);
  const spent = redemptions
    .filter((r) => r.user_id === userId)
    .reduce((sum, r) => sum + parseFloat(r.points_spent || "0"), 0);
  return earned - spent;
}

const topUps = [];
for (const user of users) {
  for (const deed of pastDeeds) {
    if (balance(user.id) >= MIN_POINTS) break;
    if (deed.poster_id === user.id) continue;
    if (signups.some((s) => s.user_id === user.id && s.opportunity_id === deed.id)) continue;
    const points = Math.round(parseFloat(deed.hours) * 10);
    signups.push({
      id: `sg_mig_${deed.id}_${user.id}`,
      opportunity_id: deed.id,
      user_id: user.id,
      status: "confirmed",
      joined_at: `${deed.date}T08:00:00.000Z`,
      done_at: `${deed.date}T15:00:00.000Z`,
      confirmed_at: `${deed.date}T18:00:00.000Z`,
      points_awarded: String(points),
    });
    topUps.push(`${user.first_name} (${user.id}) +${points} for ${deed.title}`);
  }
}

if (imagesAdded || oppsAdded) await save("opportunities", opportunities, columnsOf("opportunities"));
if (signupsAdded || topUps.length) await save("signups", signups, columnsOf("signups"));

console.log(`${DRY_RUN ? "[dry run] " : ""}Store: ${redis ? "Redis" : "CSV"}`);
console.log(`Opportunities: ${imagesAdded} images added, ${oppsAdded} rows added`);
console.log(`Signups: ${signupsAdded} seed rows added, ${topUps.length} top-ups`);
topUps.forEach((t) => console.log(`  ${t}`));
console.log("Balances:");
users.forEach((u) => console.log(`  ${u.first_name} (${u.id}): ${balance(u.id)} pts`));
