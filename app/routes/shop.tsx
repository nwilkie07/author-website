import type { Route } from "./+types/shop";
import { BooksService } from "../services/books";
import type { Book, BookWithPurchaseLinks } from "../types/db";
import { Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { SkeletonImage, SkeletonLine } from "../components/Skeleton";
import { LoadingWrapper } from "../components/LoadingWrapper";
import MultiBookCarousel from "~/components/MultiBookCarousel";
import { r2Image } from "~/utils/images";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Shop for Books" },
    { name: "description", content: "Buy books" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const service = new BooksService(db);
  const books = await service.getAllBooks();
  return { books };
}

export default function Shop({ loaderData }: Route.ComponentProps) {
  const books = (loaderData.books ?? []) as Book[];
  console.log(books)
  return (
    <div>
      <Navbar activePath="/shop" />

      <section className="bg-[#f8e7de] py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl mb-6 text-[#25384F] font-[IvyModeBold]">Shop for Books</h1>
        </div>
        <div className="flex">
          <LoadingWrapper isLoading={books.length === 0} variant="grid" skeletonCount={3}>
            {books.length > 0 && (
            <MultiBookCarousel
            containerClassName="px-8"
              items={books.map(it => ({ id: it.id, imageUrl: r2Image(it.image_url), title: it.name, description: it.description ?? '' }))}
            />
        )}
          </LoadingWrapper>
        </div>
      </section>

      <Footer showNewsletter={false} />
    </div>
  );
}
