import { NextResponse } from "next/server";
import { createDb } from "@/lib/server/db";
import { MAX_IMAGE_BYTES, parseDataUrl, saveImage } from "@/lib/server/images";

/** Upload a deed photo. Body: { user_id, data_url } where data_url is a base64 JPEG/PNG/WebP. */
export async function POST(request: Request) {
  const { user_id, data_url } = await request.json();

  const db = createDb();
  if (!user_id || !(await db.getUserById(user_id))) {
    return NextResponse.json({ error: "unauthorised", message: "Log in to upload a photo" }, { status: 401 });
  }

  const parsed = parseDataUrl(data_url);
  if (!parsed) {
    return NextResponse.json({ error: "invalid_image", message: "Use a JPEG, PNG or WebP photo" }, { status: 400 });
  }
  if (parsed.buffer.length > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "too_large", message: "That photo is too large" }, { status: 413 });
  }

  const id = await saveImage(parsed.type, parsed.buffer);
  return NextResponse.json({ image_url: `/api/images/${id}` }, { status: 201 });
}
