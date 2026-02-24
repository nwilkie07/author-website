import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { BooksService } from "../services/books";
import type { BookWithPurchaseLinks } from "../types/db";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const booksService = new BooksService(db);
  
  let books: BookWithPurchaseLinks[] = [];
  try {
    books = await booksService.getAllBooksWithPurchaseLinks();
  } catch (error) {
    console.error("Failed to fetch books:", error);
  }
  
  return { 
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
    books 
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome message={loaderData.message} books={loaderData.books} />;
}
