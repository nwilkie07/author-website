/**
 * R2 storage utility helpers.
 *
 * Thin wrappers around the Cloudflare `R2Bucket` binding so the rest of the
 * codebase doesn't need to deal with the raw R2 API directly. All functions
 * accept the bucket binding as their first argument (injected from the
 * Cloudflare env) to keep them stateless and easily testable.
 *
 * Image URLs are always served through the `/images/*` proxy route
 * (`images.$.tsx`) rather than directly from the R2 public URL, so that
 * long-lived `Cache-Control` and `ETag` headers are applied consistently.
 */

/** Normalised metadata for a single object stored in R2. */
export interface R2File {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
}

/** Lists up to 1000 objects in the bucket, optionally filtered by key prefix. */
export async function listFiles(bucket: R2Bucket, prefix?: string): Promise<R2File[]> {
  const result = await bucket.list({ prefix, limit: 1000 });
  
  return result.objects.map((obj: { key: string; size: number; uploaded: Date; etag: string }) => ({
    key: obj.key,
    size: obj.size,
    lastModified: obj.uploaded,
    etag: obj.etag,
  }));
}

/** Retrieves a single R2 object by key. Returns `null` if not found. */
export async function getFile(bucket: R2Bucket, key: string): Promise<R2ObjectBody | null> {
  return bucket.get(key);
}

/**
 * Uploads a file to R2.
 * @param contentType - Optional MIME type stored as HTTP metadata on the object.
 */
export async function uploadFile(
  bucket: R2Bucket,
  key: string,
  body: ReadableStream | ArrayBuffer | string,
  contentType?: string
): Promise<R2Object | null> {
  return bucket.put(key, body, {
    httpMetadata: contentType ? { contentType } : undefined,
  });
}

/** Deletes an object from R2. Returns `true` on success, `false` on error. */
export async function deleteFile(bucket: R2Bucket, key: string): Promise<boolean> {
  try {
    await bucket.delete(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Constructs the direct R2 public URL for an object.
 * Prefer `getLocalImageUrl` for in-app image references so requests are
 * routed through the `/images/*` proxy with proper caching headers.
 */
export function getPublicUrl(accountId: string, bucketName: string, key: string): string {
  return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;
}

/**
 * Returns the app-relative URL for an R2 image key, routing it through the
 * `/images/*` proxy route which adds long-lived caching headers.
 */
export function getLocalImageUrl(key: string): string {
  return `/images/${key}`;
}
