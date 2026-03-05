import { useMemo } from "react";
import type { PageContent } from "~/types/db";

const CACHE_PREFIX = "pageContent_v1_";

function getCacheKey(page: string): string {
  return `${CACHE_PREFIX}${page}`;
}

function readFromCache(page: string): PageContent[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getCacheKey(page));
    if (!raw) return null;
    return JSON.parse(raw) as PageContent[];
  } catch {
    return null;
  }
}

function writeToCache(page: string, content: PageContent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getCacheKey(page), JSON.stringify(content));
  } catch {
    // localStorage may be unavailable (private browsing quota exceeded, etc.)
  }
}

/**
 * Wraps a server-supplied pageContent Promise with localStorage caching.
 *
 * On the first visit the server Promise resolves normally and the result is
 * stored in localStorage.  On subsequent visits the cached value is returned
 * immediately (so <Await> resolves synchronously and avoids a loading flash),
 * while the server Promise still runs in the background and refreshes the cache
 * with the latest data.
 *
 * @param page       The page key used as the cache namespace (e.g. "home").
 * @param serverData The Promise<PageContent[]> returned from the route loader.
 * @returns          A Promise<PageContent[]> that resolves from cache when
 *                   available, otherwise waits for the server response.
 */
export function usePageContentCache(
  page: string,
  serverData: PageContent[] | Promise<PageContent[]>
): Promise<PageContent[]> {
  return useMemo(() => {
    // If the loader already resolved the data (e.g. during SSR hydration),
    // write it to cache and return it as-is.
    if (!isPromise(serverData)) {
      writeToCache(page, serverData);
      return Promise.resolve(serverData);
    }

    const cached = readFromCache(page);

    // Always let the server promise run so the cache stays fresh.
    const freshPromise = serverData.then((fresh) => {
      writeToCache(page, fresh);
      return fresh;
    });

    // If we have a cached value, return it immediately so the UI renders
    // without waiting for the network.  The cache will be updated silently
    // in the background via freshPromise.
    if (cached !== null) {
      return Promise.resolve(cached);
    }

    return freshPromise;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, serverData]);
}

function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as Promise<T>).then === "function"
  );
}
