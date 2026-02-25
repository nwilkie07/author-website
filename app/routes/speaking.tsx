import type { Route } from "./+types/home";
import type { PageContent } from "~/types/db";
import Speaking from "../speaking/speaking";
import { PageContentService } from "~/services/pageContent";

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const pageContentService = new PageContentService(db);
  
  let pageContent: PageContent[] = [];
  try {
    pageContent = await pageContentService.getContentByPage("speaking");
  } catch (error) {
    console.error("Failed to fetch content.", error);
  }
  
  return { 
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
    pageContent
  };
}

export default function SpeakingPage({ loaderData }: Route.ComponentProps) {
  return <Speaking pageContent={loaderData.pageContent} message={loaderData.message}/>;
}
