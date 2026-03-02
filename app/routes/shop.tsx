import type { Route } from "./+types/shop";
import { BooksService } from "../services/books";
import type { BookWithPurchaseLinks, PurchaseLink } from "../types/db";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { BookDisplay } from "../components/BookDisplay";
import { r2Image } from "~/utils/images";
import type { BookItem } from "~/types/books";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Shop for Books" },
    { name: "description", content: "Buy books" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const service = new BooksService(db);
  const books = await service.getAllBooksWithPurchaseLinks();
  return { books };
}

export type { BookItem, SeriesGroup } from "~/types/books";

export default function Shop({ loaderData }: Route.ComponentProps) {
  const books = (loaderData?.books ?? []) as BookWithPurchaseLinks[];
  const bookItems: BookItem[] = books.map((it) => ({
    id: it.id,
    name: it.name,
    imageUrl: r2Image(it.image_url),
    description: it.description,
    seriesTitle: it.series_title,
    seriesNumber: it.series_number,
    byLine: it.by_line,
    purchaseLinks: it.purchase_links as PurchaseLink[],
  }));

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
          <BookDisplay books={bookItems} isLoading={books.length === 0} />
        </div>
      </section>
      <Footer showNewsletter={false} />
    </div>
  );
}
