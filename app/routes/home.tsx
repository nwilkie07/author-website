import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { BooksService } from "../services/books";
import { TestimonialsService } from "~/services/testimonials";
import type { BookWithPurchaseLinks, PageContent, Testimonial } from "../types/db";
import { PageContentService } from "~/services/pageContent";
import { MailchimpService } from "~/services/mailchimp";

export function meta({}: Route["MetaArgs"]) {
  return [
    { title: "Karen MacLeod-Wilkie Author" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader({ context }: Route["LoaderArgs"]) {
  const db = context.cloudflare.env.DB;
  const kv = context.cloudflare.env.KV_CACHE;
  const ctx = context.cloudflare.ctx;
  const booksService = new BooksService(db);
  const pageContentService = new PageContentService(db);
  const testimonialsService = new TestimonialsService(db);

  const booksPromise: Promise<BookWithPurchaseLinks[]> = booksService
    .getAllBooksWithPurchaseLinks()
    .catch((error) => {
      console.error("Failed to fetch books:", error);
      return [];
    });

  const pageContentPromise: Promise<PageContent[]> = pageContentService
    .getContentByPage("home")
    .catch((error) => {
      console.error("Failed to fetch pageContent:", error);
      return [];
    });

  const testimonialsPromise: Promise<Testimonial[]> = testimonialsService
    .getAllTestimonials()
    .catch((error) => {
      console.error("Failed to fetch testimonials:", error);
      return [];
    });

  // Pre-warm the Mailchimp KV cache in the background so the /emails page
  // is fast on first visit. warmCache only calls Mailchimp for entries not
  // already in KV, so subsequent home page loads are effectively free.
  if (context.cloudflare.env.MAIL_CHIMP_API) {
    const mailchimp = new MailchimpService(context.cloudflare.env.MAIL_CHIMP_API, kv);
    ctx.waitUntil(mailchimp.warmCache());
  }

  return {
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
    books: booksPromise,
    pageContent: pageContentPromise,
    testimonials: testimonialsPromise,
  };
}

export default function Home({ loaderData }: Route["ComponentProps"]) {
  return (
    <Welcome
      message={loaderData.message}
      books={loaderData.books}
      pageContent={loaderData.pageContent}
      testimonials={loaderData.testimonials}
    />
  );
}
