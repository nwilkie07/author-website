import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { BooksService } from "../services/books";
import { TestimonialsService } from "~/services/testimonials";
import type { BookWithPurchaseLinks, PageContent, Testimonial } from "../types/db";
import { PageContentService } from "~/services/pageContent";

export function meta({}: Route["MetaArgs"]) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ context }: Route["LoaderArgs"]) {
  const db = context.cloudflare.env.DB;
  const booksService = new BooksService(db);
  const pageContentService = new PageContentService(db)
  const testimonialsService = new TestimonialsService(db);
  
  let books: BookWithPurchaseLinks[] = [];
  let pageContent: PageContent[] = []
  let testimonials: Testimonial[] = [];
  try {
    books = await booksService.getAllBooksWithPurchaseLinks();
    pageContent = await pageContentService.getContentByPage("home");
    testimonials = await testimonialsService.getAllTestimonials();
  } catch (error) {
    console.error("Failed to fetch books, pageContent, or testimonials:", error);
  }
  
  return { 
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
    books,
    pageContent,
    testimonials
  };
}

export default function Home({ loaderData }: Route["ComponentProps"]) {
  return <Welcome message={loaderData.message} books={loaderData.books} pageContent={loaderData.pageContent} testimonials={loaderData.testimonials} />;
}
