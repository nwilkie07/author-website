/**
 * createPageContentLoader — factory for per-page React Router loaders.
 *
 * The about, contact, and speaking routes all need the same pattern:
 *  1. Get the D1 binding from the Cloudflare env.
 *  2. Fetch `page_contents` rows for a specific page name.
 *  3. Return a deferred Promise so the route shell renders immediately.
 *
 * This factory eliminates that boilerplate. Pass the page name (e.g.
 * "about") and it returns a ready-to-use React Router `loader` function.
 *
 * Errors are caught and logged; the loader resolves to `[]` rather than
 * throwing so a missing DB row never causes a hard error page.
 */
import { PageContentService } from "~/services/pageContent";
import type { PageContent } from "~/types/db";

/** Minimal shape of the loader argument needed to access Cloudflare env. */
export interface LoaderContext {
  context: {
    cloudflare: {
      env: Env;
    };
  };
}

export function createPageContentLoader(page: string) {
  return function loader({ context }: LoaderContext) {
    const db = context.cloudflare.env.DB;
    const pageContentService = new PageContentService(db);

    const pageContent: Promise<PageContent[]> = pageContentService
      .getContentByPage(page)
      .catch((error) => {
        console.error("Failed to fetch content.", error);
        return [];
      });

    return {
      pageContent,
    };
  };
}
