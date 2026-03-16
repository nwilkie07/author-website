import { PageContentService } from "~/services/pageContent";
import type { PageContent } from "~/types/db";

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
