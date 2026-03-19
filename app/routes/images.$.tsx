/**
 * GET /images/*
 *
 * Image proxy route — streams any object from the IMAGES_BUCKET R2 binding
 * by its key path (everything after "/images/").
 *
 * Why proxy instead of using a public R2 URL?
 *  - Centralises cache-control: sets `Cache-Control: public, max-age=31536000,
 *    immutable` and an `ETag` so browsers and Cloudflare edge cache images
 *    aggressively.
 *  - Keeps the R2 bucket private (no public access policy required).
 *  - Allows future transformations (resizing, format conversion) without
 *    changing any call sites.
 *
 * Returns 400 if no key is provided, 404 if the object doesn't exist in R2.
 */
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
