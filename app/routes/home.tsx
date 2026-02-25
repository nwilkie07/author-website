import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { BooksService } from "../services/books";
import type { BookWithPurchaseLinks, PageContent } from "../types/db";
import { PageContentService } from "~/services/pageContent";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const booksService = new BooksService(db);
  const pageContentService = new PageContentService(db)
  
  let books: BookWithPurchaseLinks[] = [];
  let pageContent: PageContent[] = []
  try {
    books = await booksService.getAllBooksWithPurchaseLinks();
    pageContent = await pageContentService.getContentByPage("home");
  } catch (error) {
    console.error("Failed to fetch books and pageContent:", error);
  }
  
  return { 
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
    books,
    pageContent
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome message={loaderData.message} books={loaderData.books} pageContent={loaderData.pageContent} />;
}
