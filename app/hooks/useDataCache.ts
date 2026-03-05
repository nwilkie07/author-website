import { useMemo } from "react";

// Simple localStorage-backed cache for data loaded via route loaders.
// The hook returns a Promise<T> that resolves with cached data if available,
// while also ensuring the server-provided data is cached and refreshed in the background.

export function readFromCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// Synchronous read helper for consumers who want instant access to cached data
export function readFromCacheSync<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeToCache<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors (quota, private mode, etc.)
  }
}

function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return value !== null && typeof value === "object" && typeof (value as Promise<T>).then === "function";
}

export function useDataCache<T>(cacheKey: string, serverData: T | Promise<T>): Promise<T> {
  return useMemo(() => {
    // If data is already available (SSR hydration, etc.), cache and return immediately
    if (!isPromise(serverData)) {
      writeToCache(cacheKey, serverData);
      return Promise.resolve(serverData);
    }

    const cached = readFromCache<T>(cacheKey);

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
  }, [cacheKey, serverData]);
}
