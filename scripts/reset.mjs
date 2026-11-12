import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const TABLE_NAMES = [
  "users",
  "opportunities",
  "signups",
  "businesses",
  "offers",
  "redemptions",
  "postcodes",
  "categories",
];

const DATA_DIR = path.join(process.cwd(), "data");
const SEED_DIR = path.join(DATA_DIR, "seed");

function redisUrl() {
  return process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
}

function redisToken() {
  return process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
}

function seedRows(name) {
  const seedFile = path.join(SEED_DIR, `${name}.csv`);
  if (!fs.existsSync(seedFile)) return [];
  const content = fs.readFileSync(seedFile, "utf8");
  if (!content.trim()) return [];
  return parse(content, { columns: true, skip_empty_lines: true });
}

async function resetRedis() {
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({ url: redisUrl(), token: redisToken() });
  await Promise.all(TABLE_NAMES.map((name) => redis.set(`gd:table:${name}`, seedRows(name))));
  console.log("Reset Redis tables from data/seed/*.csv");
}

function resetCsv() {
  TABLE_NAMES.forEach((name) => {
    const seedFile = path.join(SEED_DIR, `${name}.csv`);
    if (fs.existsSync(seedFile)) {
      fs.copyFileSync(seedFile, path.join(DATA_DIR, `${name}.csv`));
    }
  });
  console.log("Reset data/*.csv from data/seed/*.csv");
}

if (redisUrl() && redisToken()) {
  await resetRedis();
} else {
  resetCsv();
}
