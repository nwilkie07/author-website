import type { Route } from "./+types/speaking";
import Speaking from "../speaking/speaking";
import { createPageContentLoader } from "~/utils/pageContentLoader";

export const loader = createPageContentLoader("speaking");

export default function SpeakingPage({ loaderData }: Route["ComponentProps"]) {
  return <Speaking pageContent={loaderData.pageContent} message={loaderData.message} />;
}
