import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { Redis } from "@upstash/redis";
import { TABLE_NAMES, type Row, type TableName } from "./schema";

const SEED_DIR = path.join(process.cwd(), "data", "seed");

function redisUrl() {
  return process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
}

function redisToken() {
  return process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
}

export function hasRedisConfig(): boolean {
  return Boolean(redisUrl() && redisToken());
}

let client: Redis | null = null;

function getClient(): Redis {
  if (!client) {
    client = new Redis({ url: redisUrl()!, token: redisToken()! });
  }
  return client;
}

function redisKey(name: TableName) {
  return `gd:table:${name}`;
}

function seedRows(name: TableName): Row[] {
  const seedFile = path.join(SEED_DIR, `${name}.csv`);
  if (!fs.existsSync(seedFile)) return [];
  const content = fs.readFileSync(seedFile, "utf8");
  if (!content.trim()) return [];
  return parse(content, { columns: true, skip_empty_lines: true }) as Row[];
}

export async function readTableRedis(name: TableName): Promise<Row[]> {
  const redis = getClient();
  const existing = await redis.get<Row[]>(redisKey(name));
  if (existing) return existing;
  const seeded = seedRows(name);
  await redis.set(redisKey(name), seeded);
  return seeded;
}

export async function writeTableRedis(name: TableName, rows: Row[]): Promise<void> {
  const redis = getClient();
  await redis.set(redisKey(name), rows);
}

export async function resetRedis(): Promise<void> {
  const redis = getClient();
  await Promise.all(
    TABLE_NAMES.map((name) => redis.set(redisKey(name), seedRows(name))),
  );
}
