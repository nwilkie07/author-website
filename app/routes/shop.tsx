import type { Route } from "./+types/shop";
import { BooksService } from "../services/books";
import type { BookWithPurchaseLinks, PurchaseLink } from "../types/db";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { LoadingWrapper } from "../components/LoadingWrapper";
import MultiBookCarousel from "~/components/MultiBookCarousel";
import { r2Image } from "~/utils/images";
import { useState } from "react";
import { Modal } from "~/components/Modal";

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

export type BookItem = {
  id: number;
  name: string;
  imageUrl: string;
  description: string | null;
  seriesTitle: string | null;
  seriesNumber: number | null;
  purchaseLinks: PurchaseLink[];
};

export type SeriesGroup = {
  title: string;
  books: BookItem[];
};

function SeriesModal({
  series,
  isOpen,
  onClose,
}: {
  series: SeriesGroup;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const sortedBooks = [...series.books].sort(
    (a, b) => (a.seriesNumber ?? 0) - (b.seriesNumber ?? 0),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#25384F]">{series.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBooks.map((book) => (
              <div
                key={book.id}
                className="flex flex-col items-center text-center"
              >
                <img
                  src={r2Image(book.imageUrl)}
                  alt={book.name}
                  className="w-32 h-48 object-cover rounded shadow mb-3"
                />
                <h3 className="font-semibold text-lg text-[#25384F]">
                  {book.name}
                </h3>
                {book.seriesNumber && (
                  <p className="text-sm text-gray-600">
                    Book {book.seriesNumber}
                  </p>
                )}
                {book.purchaseLinks.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 justify-center">
                    {book.purchaseLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-black text-white px-4 py-2 rounded-full text-sm hover:bg-gray-800"
                      >
                        Buy on {link.store_name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Shop({ loaderData }: Route.ComponentProps) {
  const books = (loaderData?.books ?? []) as BookWithPurchaseLinks[];
  const bookItems: BookItem[] = books.map((it) => ({
    id: it.id,
    name: it.name,
    imageUrl: r2Image(it.image_url),
    description: it.description,
    seriesTitle: it.series_title,
    seriesNumber: it.series_number,
    purchaseLinks: it.purchase_links as PurchaseLink[],
  }));

  const seriesGroups: SeriesGroup[] = [];
  const standaloneBooks: BookItem[] = [];

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLinks, setModalLinks] = useState<PurchaseLink[]>([]);
  const [modalBookTitle, setModalBookTitle] = useState<string>("");
  const handleImageClick = (item: {
    imageUrl: string;
    title?: string;
    purchaseLinks?: PurchaseLink[];
  }) => {
    setModalLinks(item.purchaseLinks ?? []);
    setModalBookTitle(item.title ?? "");
    setModalOpen(true);
  };

  bookItems.forEach((book) => {
    if (book.seriesTitle) {
      const existing = seriesGroups.find((g) => g.title === book.seriesTitle);
      if (existing) {
        existing.books.push(book);
      } else {
        seriesGroups.push({ title: book.seriesTitle, books: [book] });
      }
    } else {
      standaloneBooks.push(book);
    }
  });

  seriesGroups.forEach((group) => {
    group.books.sort((a, b) => (a.seriesNumber ?? 0) - (b.seriesNumber ?? 0));
  });

  seriesGroups.sort((a, b) => a.title.localeCompare(b.title));

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
          <LoadingWrapper
            isLoading={books.length === 0}
            variant="grid"
            skeletonCount={3}
          >
            {seriesGroups.length > 0 &&
              seriesGroups.map(({ title, books }) => {
                return (
                  <div className="pb-6">
                    <div className="flex w-full justify-center align-center">
                      <div className="bg-white text-[#25384F] font-[IvyModeSemiBold] text-2xl rounded-lg p-4 mx-8 w-[70%] text-center">
                        {title}
                      </div>
                    </div>
                    <MultiBookCarousel
                      containerClassName="px-8"
                      onImageClick={handleImageClick}
                      items={books.map((it) => ({
                        id: it.id,
                        imageUrl: it.imageUrl,
                        title: it.name,
                        description: it.description ?? "",
                        seriesNumber: it.seriesNumber,
                        seriesTitle: it.seriesTitle,
                        purchaseLinks: it.purchaseLinks,
                      }))}
                    />
                  </div>
                );
              })}
          </LoadingWrapper>
        </div>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Purchase Links"
          purchaseLinks={modalLinks}
          bookTitle={modalBookTitle}
        />
      </section>
      <Footer showNewsletter={false} />
    </div>
  );
}
