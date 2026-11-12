import { loadImage } from "@/lib/server/images";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = await loadImage(id);
  if (!image) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(image.buffer), {
    headers: {
      "Content-Type": image.type,
      // Image ids are never reused, so the bytes behind a URL never change.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
