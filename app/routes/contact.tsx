import type { Route } from "./+types/contact";
import { default as Contact } from "../contact/contact";
import { createPageContentLoader } from "~/utils/pageContentLoader";

export const loader = createPageContentLoader("contact");

export default function ContactPage({ loaderData }: Route["ComponentProps"]) {
  return <Contact message={loaderData.message} pageContent={loaderData.pageContent} />;
}
