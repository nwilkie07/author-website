/**
 * Returns the app-relative URL for an R2 image, routed through the
 * `/images/*` proxy (`images.$.tsx`) which streams the object from the
 * IMAGES_BUCKET R2 binding and sets a one-year immutable Cache-Control header.
 *
 * Use this everywhere an image stored in R2 needs to be referenced in JSX so
 * the URL scheme stays consistent and cache-busting is handled in one place.
 *
 * @param key - The R2 object key (e.g. "covers/book.jpg")
 * @returns   - "/images/covers/book.jpg"
 */
export function r2Image(key: string): string {
  return `/images/${key}`;
}
