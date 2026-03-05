import type { Route } from "./+types/about";
import AboutComp from "../about/about";
import { createPageContentLoader } from "~/utils/pageContentLoader";

export const loader = createPageContentLoader("about");

export default function About({ loaderData }: Route["ComponentProps"]) {
  return <AboutComp pageContent={loaderData.pageContent} message={loaderData.message} />;
}
