import { Link } from "react-router";
import { r2Image } from "../utils/images";
import type { BookWithPurchaseLinks, PageContent } from "../types/db";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Carousel } from "../components/Carousel";
import { Modal } from "../components/Modal";
import type { PurchaseLink } from "../types/db";
import { useState } from "react";

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

  return (
    <div>
      <Navbar activePath="/" />

      <section
        className="relative h-[60vh] md:h-[520px] bg-center bg-cover"
        style={{
          backgroundImage: `url('${r2Image("static_photos/home_background.jpg")}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-4xl mx-auto h-full flex items-center">
          <div className="text-white space-y-6 pl-6 md:pl-0">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl tracking-tight drop-shadow-md w-full"
              style={{ lineHeight: 1.1 }}
            >
              Let’s transport you to another time and place…
            </h1>
            <button className="bg-[#F3E3DD] text-[#0e2a48] px-12 py-6 rounded-full font-large text-2xl">
              view all books
            </button>
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
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col gap-8 items-start">
            <div className="flex w-full justify-center">
              {books.length > 0 ? (
                <Carousel
                  items={carouselItems}
                  autoPlay={false}
                  showTitle={true}
                  showDescription={true}
                  imageHeight="500px"
                  className="shadow-xl"
                  onImageClick={handleImageClick}
                />
              ) : (
                <div className="text-center text-gray-500 py-20 bg-white rounded-lg">
                  No books available. Add some books in the admin panel.
                </div>
              )}
            </div>
            <div className="flex flex-col items-center justify-center space-y-4 w-full">
              <div className="text-blue-700 font-semibold leading-tight text-center">
                More great reads coming soon
              </div>
              <Link
                to="/shop"
                className="bg-[#0e2a48] text-white px-8 py-3 rounded-full hover:bg-[#1a3a58] transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
        <img
          src={r2Image("static_photos/footer_one.png")}
          alt="profile"
          className="w-full"
        />
      </section>

      <section className="bg-[#f3e3dd] pt-20 pb-16">
        <div className="flex flex-row px-8 items-center justify-center">
          <img
            src={r2Image("static_photos/profile.png")}
            alt="profile"
            className="w-[40%]"
          />
          {pageContent.length == 1 ? (
            <div className="flex flex-col pl-24 gap-12">
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
                <button className="bg-white text-[#426684] px-8 py-6 rounded-full font-large text-2xl font-[athelasbook]">
                  about me
                </button>
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
