/**
 * useDataCache — localStorage-backed client-side data cache for route loaders.
 *
 * Architecture overview
 * ─────────────────────
 * React Router defers expensive D1 queries so the page shell renders
 * immediately. However, on repeat visits the deferred Promise still causes
 * a skeleton flash while the network request is in-flight.
 *
 * This module solves that with a stale-while-revalidate pattern:
 *
 *  1. On the first visit the server Promise resolves normally and the result
 *     is written to localStorage with a timestamp.
 *
 *  2. On subsequent visits `useDataCache` returns a Promise that resolves
 *     immediately from the localStorage cache (no skeleton), while the fresh
 *     server Promise runs in the background and updates the cache once it
 *     settles.
 *
 *  3. Cache entries expire after `ttlMs` milliseconds. Expired entries are
 *     removed and the page falls back to the live server Promise.
 *
 * All writes are fire-and-forget and wrapped in try/catch so private-browsing
 * mode (which disallows localStorage writes) never breaks the page.
 */
import { useMemo } from "react";
import type { PageContent } from "~/types/db";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function isCacheValid<T>(entry: CacheEntry<T>, ttlMs: number): boolean {
  const now = Date.now();
  return now - entry.timestamp < ttlMs;
}

/**
 * Reads a cache entry from localStorage asynchronously.
 * Returns `null` if the key is missing, unparseable, or older than `ttlMs`.
 */
export function readFromCache<T>(key: string, ttlMs: number = Infinity): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    
    // Validate TTL
    if (!isCacheValid(entry, ttlMs)) {
      // Cache expired, remove it
      localStorage.removeItem(key);
      return null;
    }
    
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Synchronously reads a cache entry from localStorage.
 *
 * Use this when you want to skip `<Suspense>` entirely by checking for cached
 * data before the component renders (e.g. conditionally rendering the resolved
 * content instead of the `<Await>` wrapper).
 *
 * Returns `null` if the key is missing, unparseable, or older than `ttlMs`.
 */
export function readFromCacheSync<T>(key: string, ttlMs: number = Infinity): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    
    // Validate TTL
    if (!isCacheValid(entry, ttlMs)) {
      // Cache expired, remove it
      localStorage.removeItem(key);
      return null;
    }
    
    return entry.data;
  } catch {
    return null;
  }
}

function writeToCache<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore storage errors (quota, private mode, etc.)
  }
}

function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return value !== null && typeof value === "object" && typeof (value as Promise<T>).then === "function";
}

/**
 * React hook that wraps a server-provided value or Promise with a
 * localStorage cache using a stale-while-revalidate strategy.
 *
 * @param cacheKey  - Unique localStorage key for this data set.
 * @param serverData - The raw value or deferred Promise from the route loader.
 * @param ttlMs     - Cache time-to-live in milliseconds (default: no expiry).
 * @returns A Promise<T> that resolves from cache immediately when available,
 *          falling back to the server Promise on a cache miss or expiry.
 */
export function useDataCache<T>(cacheKey: string, serverData: T | Promise<T>, ttlMs: number = Infinity): Promise<T> {
  return useMemo(() => {
    // If data is already available (SSR hydration, etc.), cache and return immediately
    if (!isPromise(serverData)) {
      writeToCache(cacheKey, serverData);
      return Promise.resolve(serverData);
    }

    const cached = readFromCache<T>(cacheKey, ttlMs);

    // Always refresh the cache in the background with fresh server data
    const freshPromise = serverData.then((fresh) => {
      writeToCache(cacheKey, fresh);
      return fresh;
    });

    // If we have a cached value, resolve immediately with it to avoid loading flash
    if (cached !== null) {
      return Promise.resolve(cached);
    }

    // Otherwise wait for the fresh server data
    return freshPromise;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, serverData, ttlMs]);
}

// Namespace prefix used for page-content cache keys so they don't collide with
// other useDataCache entries and remain stable across refactors.
const PAGE_CONTENT_CACHE_PREFIX = "pageContent_v1_";

/**
 * Convenience wrapper around useDataCache for PageContent arrays.
 *
 * Accepts a plain page name (e.g. "home") and automatically namespaces the
 * localStorage key as `pageContent_v1_<page>`, keeping it consistent with
 * the keys written by the previous standalone usePageContentCache hook.
 *
 * @param page - The page name (e.g. "home", "contact")
 * @param serverData - The server-provided data or a Promise that resolves to it
 * @param ttlMs - Time-to-live in milliseconds. Defaults to Infinity (no expiration)
 */
export function usePageContentCache(
  page: string,
  serverData: PageContent[] | Promise<PageContent[]>,
  ttlMs: number = Infinity
): Promise<PageContent[]> {
  return useDataCache<PageContent[]>(`${PAGE_CONTENT_CACHE_PREFIX}${page}`, serverData, ttlMs);
}
