import { Link } from "react-router";
import { r2Image } from "../utils/images";
import type { BookWithPurchaseLinks } from "../types/db";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Carousel } from "../components/Carousel";
import { Modal } from "../components/Modal";
import type { PurchaseLink } from "../types/db";
import { useState } from "react";

export function Welcome({
  message,
  books = [],
}: {
  message: string;
  books?: BookWithPurchaseLinks[];
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
  const handleImageClick = (item: { imageUrl: string; title?: string; purchaseLinks?: PurchaseLink[] }) => {
    setModalLinks(item.purchaseLinks ?? []);
    setModalBookTitle(item.title ?? "");
    setModalOpen(true);
  };

  return (
    <div>
      <Navbar activePath="/" />

      <section
        className="relative h-[520px] bg-center bg-cover"
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

      <section className="bg-[#f1d9cf] pt-12 pb-20 relative">
        <svg
          viewBox="0 0 1440 320"
          className="absolute left-0 bottom-0 w-full"
          preserveAspectRatio="none"
          style={{ height: 120 }}
        >
          <path
            fill="#0e2a48"
            d="M0,224L60,240C120,256,240,288,360,272C480,256,600,192,720,181.3C840,171,960,213,1080,234.7C1200,256,1320,256,1380,240L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
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
      </section>

      <section className="bg-[#f4e6df] pt-20 pb-28">
        <div className="flex flex-row px-8 items-center justify-center">
          <img
            src={r2Image("static_photos/profile.png")}
            alt="profile"
            className="w-[40%]"
          />
          <div className="flex flex-col pl-24 gap-12">
            <div className="flex w-fit h-fit text-5xl text-[#0e2a48] font-[IvyModeBold]">
              Welcome to my adventures in writing.
            </div>
            <div className="flex w-fit h-fit text-gray-700 leading-relaxed text-2xl font-[AthelasBook]">
              I write fantasy fiction for curious audiences who value friendship
              and respect in a variety of relationships. My quirky characters
              will lead you into adventure in contemporary and fantastical
              worlds. Through their eyes explore real life issues with a touch
              of humour and warmth and feel how their healing experiences
              unfold.
            </div>
            <div>
            <button className="bg-white text-[#426684] px-8 py-6 rounded-full font-large text-2xl font-[athelasbook]">
              about me
            </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 border-t border-gray-200 text-center text-sm text-[#426684] font-[IvyModeSemiBold]">
        <blockquote className="mx-auto max-w-3xl text-2xl">
          "The characters in the book are amazing! The mix of personalities and
          acceptance of each other's differences is just wonderful. It will have
          you hooked from the first page. Can't wait for the next one to be
          available."
        </blockquote>
        <div className="mt-4">
          — Jonh Doe. • A Verified Amazon Purchase of the Book
        </div>
      </section>

      <Footer />
    </div>
  );
}
