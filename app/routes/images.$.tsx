import type { Route } from "./+types/images.$";

export async function loader({ params, context }: Route.LoaderArgs) {
  const key = params["*"];
  
  if (!key) {
    throw new Response("Image key required", { status: 400 });
  }

  const bucket = context.cloudflare.env.IMAGES_BUCKET;
  const object = await bucket.get(key);

  if (!object) {
    throw new Response("Image not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("ETag", object.etag);

  return new Response(object.body, { headers });
}
