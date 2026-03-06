import type { Route } from "./+types/api.prefetch";
import { BooksService } from "~/services/books";
import { TestimonialsService } from "~/services/testimonials";
import { PageContentService } from "~/services/pageContent";

/**
 * GET /api/prefetch
 *
 * Returns all public page data in a single JSON response so the client can
 * warm its localStorage cache for every page immediately after the initial
 * load — eliminating loading skeletons on subsequent navigation.
 *
 * The response contains a `cachedAt` timestamp so the client can honour the
 * same TTLs used by each individual page.
 */
export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const booksService = new BooksService(db);
  const testimonialsService = new TestimonialsService(db);
  const pageContentService = new PageContentService(db);

  // Fetch everything in parallel — D1 handles concurrent queries fine.
  const [books, testimonials, pageContentMap] = await Promise.all([
    booksService.getAllBooksWithPurchaseLinks().catch(() => []),
    testimonialsService.getAllTestimonials().catch(() => []),
    pageContentService
      .getContentByPages(["home", "about", "contact", "speaking"])
      .catch(() => ({} as Record<string, import("~/types/db").PageContent[]>)),
  ]);

  const body = {
    cachedAt: Date.now(),
    books,
    testimonials,
    pageContent: {
      home: pageContentMap["home"] ?? [],
      about: pageContentMap["about"] ?? [],
      contact: pageContentMap["contact"] ?? [],
      speaking: pageContentMap["speaking"] ?? [],
    },
  };

  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      // Allow Cloudflare edge to cache for 60 s so hammering refreshes don't
      // hit D1 every time, but still keep data reasonably fresh.
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
