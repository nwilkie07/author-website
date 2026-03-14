import { useState } from "react";
import type { PurchaseLink } from "../types/db";
import type { BookItem, SeriesGroup } from "../types/books";
import { Modal } from "~/components/Modal";
import MultiBookCarousel from "~/components/MultiBookCarousel";

export function BookDisplay({
  books,
}: {
  books: BookItem[];
}) {
  const seriesGroups: SeriesGroup[] = [];

  books.forEach((book) => {
    if (book.seriesTitle) {
      const existing = seriesGroups.find((g) => g.title === book.seriesTitle);
      if (existing) {
        existing.books.push(book);
      } else {
        seriesGroups.push({ title: book.seriesTitle, books: [book] });
      }
    }
  });

  seriesGroups.forEach((group) => {
    group.books.sort((a, b) => (a.seriesNumber ?? 0) - (b.seriesNumber ?? 0));
  });

  seriesGroups.sort((a, b) => a.title.localeCompare(b.title));

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

  return (
    <>
      {seriesGroups.map(({ title, books }) => (
        <div className="pb-6" key={title}>
          <div className="flex w-full justify-center align-center">
            <div className="bg-white text-[#25384F] font-[IvyModeSemiBold] text-2xl rounded-lg p-4 mx-8 w-[70%] text-center">
              {title}
            </div>
          </div>
          <MultiBookCarousel
            containerClassName="lg:px-8 px-2"
            onImageClick={handleImageClick}
            items={books}
          />
        </div>
      ))}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Purchase Links"
        purchaseLinks={modalLinks}
        bookTitle={modalBookTitle}
      />
    </>
  );
}
