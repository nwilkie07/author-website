import { Link } from "react-router";
import { r2Image } from "../utils/images";
import type { BookWithPurchaseLinks, PageContent } from "../types/db";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { BookDisplay } from "../components/BookDisplay";
import type { BookItem } from "~/types/books";
import LoadingWrapper from "~/components/LoadingWrapper";
import { useScreenSize } from "~/hooks/useScreenSize";

export function Welcome({
  message,
  books = [],
  pageContent = [],
}: {
  message: string;
  books?: BookWithPurchaseLinks[];
  pageContent?: PageContent[];
}) {
  const bookItems: BookItem[] = books.map((it) => ({
    id: it.id,
    name: it.name,
    imageUrl: r2Image(it.image_url),
    description: it.description,
    seriesTitle: it.series_title,
    seriesNumber: it.series_number,
    byLine: it.by_line,
    alt_text: it.alt_text,
    purchaseLinks: it.purchase_links as any[],
  }));

  const isLoading = !pageContent || pageContent.length === 0;
  const {isMobile} = useScreenSize();

  return (
    <div>
      <Navbar activePath="/" />

      <section
        className="h-[60vh] md:max-h-[600px] bg-center bg-cover"
        style={{
          backgroundImage: `url('${r2Image("static_photos/home_background.jpg")}')`,
        }}
      >
        <img
          src={r2Image("static_photos/home_background.jpg")}
          alt="The Author Karen MacLeod-Wilkie sits at a wooden dining table in a bright room, wearing a patterned burgundy and teal blouse. She holds a coffee mug in one hand and rests the other hand on The Prophecy book. The table has woven placemats and a few stacked books; a window with greenery is in the background. Karen is smiling while on the process of opening The Prophecy."
          className="hidden"
        />
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
      </section>

      <section className="bg-[#f3e3dd] pt-12 relative">
        <div className="flex flex-col">
          <BookDisplay books={bookItems} isLoading={books.length === 0} skeletonCount={isMobile ? 3 : 9} />
        </div>
        <img
          src={r2Image("static_photos/footer_one.png")}
          alt="Decorative footer illustration"
          className="w-full"
        />
      </section>

      <section className="bg-[#f3e3dd] pt-20 pb-16">
        <div className="flex flex-col md:flex-row px-8 items-center justify-center w-full">
          <img
            src={r2Image("static_photos/profile.png")}
            alt="Author portrait"
            className="w-[40%]"
          />
          <LoadingWrapper
            isLoading={isLoading}
            variant="text"
            skeletonCount={1}
          >
            {!isLoading && (
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
            )}
          </LoadingWrapper>
        </div>
      </section>
      <section className="bg-white pb-12 border-t border-gray-200 text-center text-sm text-[#426684] font-[IvyModeSemiBold]">
        <img
          src={r2Image("static_photos/footer_two.png")}
          alt="Footer decorative image"
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
