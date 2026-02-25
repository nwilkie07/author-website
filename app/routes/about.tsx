import React from "react";
import AboutComp from "../about/about";
import type { PageContent } from "~/types/db";
import { PageContentService } from "~/services/pageContent";

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const pageContentService = new PageContentService(db);
  
  let pageContent: PageContent[] = [];
  try {
    pageContent = await pageContentService.getContentByPage("about");
  } catch (error) {
    console.error("Failed to fetch content.", error);
  }
  
  return { 
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
    pageContent
  };
}

export default function About({ loaderData }: Route.ComponentProps) {
  return <AboutComp pageContent={loaderData.pageContent} message={loaderData.message} />;
}
