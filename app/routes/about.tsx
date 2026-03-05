import React from "react";
import type { Route } from "./+types/about";
import AboutComp from "../about/about";
import { PageContentService } from "~/services/pageContent";
import type { PageContent } from "~/types/db";

export function loader({ context }: Route["LoaderArgs"]) {
  const db = context.cloudflare.env.DB;
  const pageContentService = new PageContentService(db);

  const pageContentPromise: Promise<PageContent[]> = pageContentService
    .getContentByPage("about")
    .catch((error) => {
      console.error("Failed to fetch content.", error);
      return [];
    });

  return {
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
    pageContent: pageContentPromise,
  };
}

export default function About({ loaderData }: Route["ComponentProps"]) {
  return <AboutComp pageContent={loaderData.pageContent} message={loaderData.message} />;
}
