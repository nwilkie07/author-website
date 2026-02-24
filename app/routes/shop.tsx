import type { Route } from "./+types/shop";
import { BooksService } from "../services/books";
import type { BookWithPurchaseLinks } from "../types/db";
import { Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

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

export default function Shop({ loaderData }: Route.ComponentProps) {
  const books = (loaderData.books ?? []) as BookWithPurchaseLinks[];
  return (
    <div>
      <Navbar activePath="/shop" />

      <section className="bg-[#f8e7de] py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl mb-6">Shop for Books</h1>
        </div>
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
          {books.map((b) => (
            <article key={b.id ?? b.name} className="bg-white rounded shadow p-4">
              <img src={b.image_url} alt={b.name} className="w-full h-56 object-cover mb-3" />
              <h2 className="text-lg font-semibold mb-2">{b.name}</h2>
              <p className="text-sm text-gray-700 mb-3">{b.description ?? ""}</p>
              <div className="flex items-center gap-3">
                {b.purchase_links?.length > 0 && (
                  <a href={b.purchase_links[0].url} className="bg-black text-white px-4 py-2 rounded">Buy it</a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer showNewsletter={false} />
    </div>
  );
}
