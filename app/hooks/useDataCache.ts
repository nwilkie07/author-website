import { useMemo } from "react";
import type { PageContent } from "~/types/db";

// Simple localStorage-backed cache for data loaded via route loaders.
// The hook returns a Promise<T> that resolves with cached data if available,
// while also ensuring the server-provided data is cached and refreshed in the background.

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function isCacheValid<T>(entry: CacheEntry<T>, ttlMs: number): boolean {
  const now = Date.now();
  return now - entry.timestamp < ttlMs;
}

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

// Synchronous read helper for consumers who want instant access to cached data
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
