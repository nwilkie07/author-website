import { useEffect } from "react";

// ---------------------------------------------------------------------------
// Cache key + TTL registry — must stay in sync with the values used by each
// individual page component and useDataCache / usePageContentCache.
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function writeToCache<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry<T> = { data: value, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore storage quota / private-mode errors
  }
}

function isCacheValid(key: string, ttlMs: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const entry = JSON.parse(raw) as CacheEntry<unknown>;
    return Date.now() - entry.timestamp < ttlMs;
  } catch {
    return false;
  }
}

// TTLs deliberately match those used in the individual page components so that
// prefetch data is considered fresh for exactly as long as page-loaded data.
const ONE_HOUR = 1000 * 60 * 60;

interface PrefetchPayload {
  cachedAt: number;
  books: unknown[];
  testimonials: unknown[];
  pageContent: {
    home: unknown[];
    about: unknown[];
    contact: unknown[];
    speaking: unknown[];
  };
}

/**
 * Fires once after the initial page hydration, fetches /api/prefetch, and
 * seeds the localStorage cache for every public page.  Subsequent navigations
 * will find the cache already populated and render without skeletons.
 *
 * The hook is a no-op when:
 *  - running on the server (SSR / prerender)
 *  - all cache keys are already valid (avoids redundant network requests)
 */
export function usePrefetchAllPages(): void {
  useEffect(() => {
    // Check if every key is already warm so we can skip the fetch entirely.
    const keysAndTtls: [string, number][] = [
      ["books", ONE_HOUR],
      ["shop_books", ONE_HOUR],
      ["home_testimonials", ONE_HOUR],
      ["about_page_content", ONE_HOUR],
      ["speaking_page_content", ONE_HOUR],
      ["pageContent_v1_home", ONE_HOUR],
      ["pageContent_v1_contact", ONE_HOUR],
    ];

    const allWarm = keysAndTtls.every(([key, ttl]) => isCacheValid(key, ttl));
    if (allWarm) return;

    // Use requestIdleCallback when available so prefetching doesn't compete
    // with the current page's paint / hydration work.
    const schedule =
      typeof requestIdleCallback !== "undefined"
        ? (cb: () => void) => requestIdleCallback(cb, { timeout: 3000 })
        : (cb: () => void) => setTimeout(cb, 100);

    schedule(async () => {
      try {
        const res = await fetch("/api/prefetch");
        if (!res.ok) return;

        const payload: PrefetchPayload = await res.json();

        // -- Books (shared between home and shop) --
        writeToCache("books", payload.books);
        writeToCache("shop_books", payload.books);

        // -- Testimonials --
        writeToCache("home_testimonials", payload.testimonials);

        // -- Page content --
        writeToCache("pageContent_v1_home", payload.pageContent.home);
        writeToCache("about_page_content", payload.pageContent.about);
        writeToCache("pageContent_v1_contact", payload.pageContent.contact);
        writeToCache("speaking_page_content", payload.pageContent.speaking);
      } catch {
        // Network errors are silent — pages fall back to their own loaders
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
