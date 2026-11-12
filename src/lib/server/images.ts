import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { backendName } from "./store";
import { nextId } from "./schema";

/**
 * Uploaded opportunity photos. The client resizes to a small JPEG before upload, so each one is
 * ~100-300 KB. On Vercel they live in Redis (one key per image, kept out of the opportunities table
 * so listing stays fast); locally they're files in data/uploads/.
 */

export const MAX_IMAGE_BYTES = 900 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const ID_PATTERN = /^img_\d+_\d+$/;

type StoredImage = { type: string; data: string }; // data = base64

function redis() {
  return new Redis({
    url: (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL)!,
    token: (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)!,
  });
}

export function parseDataUrl(dataUrl: unknown): { type: string; buffer: Buffer } | null {
  if (typeof dataUrl !== "string") return null;
  const match = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match || !ALLOWED_TYPES.includes(match[1])) return null;
  return { type: match[1], buffer: Buffer.from(match[2], "base64") };
}

export async function saveImage(type: string, buffer: Buffer): Promise<string> {
  const id = nextId("img");
  if (backendName() === "redis") {
    await redis().set<StoredImage>(`gd:img:${id}`, { type, data: buffer.toString("base64") });
  } else {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOAD_DIR, id), buffer);
    fs.writeFileSync(path.join(UPLOAD_DIR, `${id}.type`), type);
  }
  return id;
}

export async function loadImage(id: string): Promise<{ type: string; buffer: Buffer } | null> {
  if (!ID_PATTERN.test(id)) return null;
  if (backendName() === "redis") {
    const stored = await redis().get<StoredImage>(`gd:img:${id}`);
    return stored ? { type: stored.type, buffer: Buffer.from(stored.data, "base64") } : null;
  }
  const file = path.join(UPLOAD_DIR, id);
  if (!fs.existsSync(file)) return null;
  return { type: fs.readFileSync(`${file}.type`, "utf8"), buffer: fs.readFileSync(file) };
}

/** Only accept images we host or the curated Unsplash set — never arbitrary third-party URLs. */
export function isAllowedImageUrl(url: unknown): url is string {
  if (typeof url !== "string" || !url) return false;
  if (/^\/api\/images\/img_\d+_\d+$/.test(url)) return true;
  return url.startsWith("https://images.unsplash.com/");
}
