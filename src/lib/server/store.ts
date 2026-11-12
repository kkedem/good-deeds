import { readTableCsv, writeTableCsv, resetCsv } from "./store-csv";
import { hasRedisConfig, readTableRedis, writeTableRedis, resetRedis } from "./store-redis";
import type { Row, TableName } from "./schema";

const useRedis = hasRedisConfig();

if (process.env.VERCEL && !useRedis) {
  throw new Error(
    "Running on Vercel but no Redis credentials are set (KV_REST_API_URL/KV_REST_API_TOKEN or " +
      "UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN). Vercel's filesystem is read-only, so CSV " +
      "storage would silently fail. Add the Upstash Redis integration before deploying.",
  );
}

export function backendName(): "redis" | "csv" {
  return useRedis ? "redis" : "csv";
}

export async function readTable(name: TableName): Promise<Row[]> {
  return useRedis ? readTableRedis(name) : readTableCsv(name);
}

export async function writeTable(name: TableName, rows: Row[]): Promise<void> {
  return useRedis ? writeTableRedis(name, rows) : writeTableCsv(name, rows);
}

export async function resetStore(): Promise<void> {
  return useRedis ? resetRedis() : Promise.resolve(resetCsv());
}
