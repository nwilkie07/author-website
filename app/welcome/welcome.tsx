import { Link } from "react-router";
import { r2Image } from "../utils/images";
import type { BookWithPurchaseLinks, PageContent } from "../types/db";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Carousel } from "../components/Carousel";
import { MultiBookCarousel } from "../components/MultiBookCarousel";
import {
  SkeletonImage,
  SkeletonLine,
  SkeletonGroup,
} from "../components/Skeleton";
import { Modal } from "../components/Modal";
import type { PurchaseLink } from "../types/db";
import { useState } from "react";
import type { BookItem, SeriesGroup } from "~/routes/shop";
import LoadingWrapper from "~/components/LoadingWrapper";

export function Welcome({
  message,
  books = [],
  pageContent = [],
}: {
  message: string;
  books?: BookWithPurchaseLinks[];
  pageContent?: PageContent[];
}) {
  const carouselItems = books.map((book) => ({
    id: book.id,
    imageUrl: r2Image(book.image_url),
    title: book.name,
    description: book.description || undefined,
    purchaseLinks: book.purchase_links,
  }));

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
      <Navbar activePath="/" />

      <section
        className="h-[60vh] md:h-[520px] bg-center bg-cover"
        style={{
          backgroundImage: `url('${r2Image("static_photos/home_background.jpg")}')`,
        }}
      >
        <div className="flex w-full mx-auto h-full flex items-center justify-center">
          <div className="flex flex-col w-[80%] text-white space-y-6 pl-6 md:pl-0">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl tracking-tight drop-shadow-md w-full font-[IvyMode]"
              style={{ lineHeight: 1.1 }}
            >
              Let’s transport you to another time and place…
            </h1>
            <Link to="/shop">
            <button className="bg-[#F3E3DD] text-[#0e2a48] px-12 py-6 rounded-full font-large text-xl lg:text-2xl hover:underline hover:cursor-pointer">
              view all books
            </button>
            </Link>
          </div>
        </div>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Purchase Links"
          purchaseLinks={modalLinks}
          bookTitle={modalBookTitle}
        />
      </section>

      <section className="bg-[#f3e3dd] pt-12 relative">
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
        <img
          src={r2Image("static_photos/footer_one.png")}
          alt="profile"
          className="w-full"
        />
      </section>

      <section className="bg-[#f3e3dd] pt-20 pb-16">
        <div className="flex flex-col md:flex-row px-8 items-center justify-center">
          <img
            src={r2Image("static_photos/profile.png")}
            alt="profile"
            className="w-[40%]"
          />
          {pageContent.length == 1 ? (
            <div className="flex flex-col px-12 md:pl-24 md:gap-12 gap-8 items-center md:items-start md:items-left text-center md:text-start">
              <div className="flex w-fit h-fit text-5xl text-[#0e2a48] font-[IvyModeBold]">
                {pageContent[0].title}
              </div>
              <div className="flex w-fit h-fit text-gray-700 leading-relaxed text-2xl font-[AthelasBook]">
                {(() => {
                  const raw = pageContent[0].description ?? "";
                  let safe = raw;
                  if (typeof window !== "undefined") {
                    try {
                      // @ts-ignore
                      const lib = require("dompurify");
                      const sanitizer =
                        lib?.default?.sanitize ??
                        lib?.sanitize ??
                        ((html: string) => html);
                      safe = sanitizer(raw);
                    } catch {
                      safe = raw;
                    }
                  }
                  return (
                    <div
                      className="flex flex-col text-[#25384F] text-base md:text-xl leading-relaxed font-[AthelasBook] text-center md:text-left gap-8"
                      dangerouslySetInnerHTML={{ __html: safe }}
                    />
                  );
                })()}
              </div>
              <div>
                <Link to="/about">
                  <button className="bg-white text-[#426684] px-8 py-6 rounded-full font-large text-2xl font-[athelasbook] hover:underline hover:cursor-pointer">
                    about me
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </section>
      <section className="bg-white pb-12 border-t border-gray-200 text-center text-sm text-[#426684] font-[IvyModeSemiBold]">
        <img
          src={r2Image("static_photos/footer_two.png")}
          alt="profile"
          className="w-full"
        />
        <div className="relative top-[-50px]">
          <blockquote className="mx-auto max-w-3xl text-2xl ">
            "The characters in the book are amazing! The mix of personalities
            and acceptance of each other's differences is just wonderful. It
            will have you hooked from the first page. Can't wait for the next
            one to be available."
          </blockquote>
          <div className="mt-4">
            — Jonh Doe. • A Verified Amazon Purchase of the Book
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
