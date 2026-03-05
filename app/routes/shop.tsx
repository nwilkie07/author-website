import type { Route } from "./+types/shop";
import { BooksService } from "../services/books";
import type { BookWithPurchaseLinks, PurchaseLink } from "../types/db";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { BookDisplay } from "../components/BookDisplay";
import { r2Image } from "~/utils/images";
import type { BookItem } from "~/types/books";
import { Suspense } from "react";
import { Await } from "react-router";
import LoadingWrapper from "~/components/LoadingWrapper";
import { useDataCache, readFromCacheSync } from "~/hooks/useDataCache";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Shop for Books" },
    { name: "description", content: "Buy books" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const service = new BooksService(db);

  const booksPromise: Promise<BookWithPurchaseLinks[]> = service
    .getAllBooksWithPurchaseLinks()
    .catch((error) => {
      console.error("Failed to fetch books:", error);
      return [];
    });

  return { books: booksPromise };
}

export type { BookItem, SeriesGroup } from "~/types/books";

export default function Shop({ loaderData }: Route.ComponentProps) {
  const booksPromise = (
    loaderData as unknown as { books: Promise<BookWithPurchaseLinks[]> }
  ).books;
  // Cache books data on the client to avoid skeletons on subsequent navigations
  const cachedBooks = useDataCache<BookWithPurchaseLinks[]>(
    "shop_books",
    booksPromise,
    1000 * 60 * 60,
  );
  const cachedBooksSync =
    readFromCacheSync<BookWithPurchaseLinks[]>("shop_books");

  return (
    <div>
      <Navbar activePath="/shop" />
      <section className="bg-[#f8e7de] py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl mb-6 text-[#25384F] font-[IvyModeBold]">
            Shop for Books
          </h1>
        </div>
        <div className="flex flex-col">
          {cachedBooksSync ? (
            (() => {
              const books = cachedBooksSync;
              const bookItems: BookItem[] = books.map((it) => ({
                id: it.id,
                name: it.name,
                imageUrl: r2Image(it.image_url),
                description: it.description,
                seriesTitle: it.series_title,
                seriesNumber: it.series_number,
                byLine: it.by_line ?? "",
                altText: it.alt_text ?? "",
                purchaseLinks: it.purchase_links as PurchaseLink[],
              }));
              return <BookDisplay books={bookItems} />;
            })()
          ) : (
            <Suspense
              fallback={
                <LoadingWrapper variant="carousel" className="flex w-[100vw]" />
              }
            >
              <Await resolve={cachedBooks}>
                {(books) => {
                  const bookItems: BookItem[] = books.map((it) => ({
                    id: it.id,
                    name: it.name,
                    imageUrl: r2Image(it.image_url),
                    description: it.description,
                    seriesTitle: it.series_title,
                    seriesNumber: it.series_number,
                    byLine: it.by_line ?? "",
                    altText: it.alt_text ?? "",
                    purchaseLinks: it.purchase_links as PurchaseLink[],
                  }));
                  return <BookDisplay books={bookItems} />;
                }}
              </Await>
            </Suspense>
          )}
        </div>
      </section>
      <Footer showNewsletter={false} />
    </div>
  );
}
