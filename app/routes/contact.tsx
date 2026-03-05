import type { PageContent } from "~/types/db";
import type { Route } from "./+types/contact";
import { default as Contact } from "../contact/contact";
import { PageContentService } from "~/services/pageContent";

export function loader({ context }: Route["LoaderArgs"]) {
  const db = context.cloudflare.env.DB;
  const pageContentService = new PageContentService(db);

  const pageContentPromise: Promise<PageContent[]> = pageContentService
    .getContentByPage("contact")
    .catch((error) => {
      console.error("Failed to fetch content.", error);
      return [];
    });

  return {
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
    pageContent: pageContentPromise,
  };
}

export default function ContactPage({ loaderData }: Route["ComponentProps"]) {
  return <Contact message={loaderData.message} pageContent={loaderData.pageContent} />;
}
