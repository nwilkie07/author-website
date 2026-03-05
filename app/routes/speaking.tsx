import type { Route } from "./+types/speaking";
import type { PageContent } from "~/types/db";
import Speaking from "../speaking/speaking";
import { PageContentService } from "~/services/pageContent";

export function loader({ context }: Route["LoaderArgs"]) {
  const db = context.cloudflare.env.DB;
  const pageContentService = new PageContentService(db);

  const pageContentPromise: Promise<PageContent[]> = pageContentService
    .getContentByPage("speaking")
    .catch((error) => {
      console.error("Failed to fetch content.", error);
      return [];
    });

  return {
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
    pageContent: pageContentPromise,
  };
}

export default function SpeakingPage({ loaderData }: Route["ComponentProps"]) {
  return <Speaking pageContent={loaderData.pageContent} message={loaderData.message} />;
}
