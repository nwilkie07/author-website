import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { r2Image } from "~/utils/images";
import { sanitizeHTML } from "../utils/sanitizeHTML";
import { LoadingWrapper } from "../components/LoadingWrapper";
import type { PageContent } from "~/types/db";
// Client-side HTML sanitizer (optional: falls back to identity if lib not available)

export default function Speaking({
  message,
  pageContent = [],
}: {
  message: string;
  pageContent?: PageContent[];
}) {
    const isLoading = !pageContent || pageContent.length === 0;

  return (
    <div>
      <Navbar activePath="/speaking" authorName="Karen MacLeod-Wilkie" />
      <div className="flex items-center h-48 md:h-[36rem] overflow-hidden">
        <img
          src={r2Image("static_photos/speaking_background.jpg")}
          alt="The Author Karen MacLeod-Wilkie sits in a cushioned wicker chair smiling while reading The Prophecy book. She is surrounded by multiple plants and large windows brightly lighting the space. "
          className="w-full h-full object-cover"
        />
      </div>
      <div className="bg-white flex py-12">
        <LoadingWrapper
          isLoading={isLoading}
          variant="text"
          skeletonCount={1}
        >
          {pageContent.length > 0 ? (
            <div className="flex flex-col container mx-auto items-center py-8 px-4 md:px-24 gap-8 md:text-left">
              <div className="text-2xl md:text-4xl text-[#426684] font-[IvyModeSemiBold] mb-6 text-left">
                {pageContent[0].title}
              </div>
              {(() => {
                const raw = pageContent[0].description ?? "";
                const safe = sanitizeHTML(raw);
                return (
                  <div
                    className="flex flex-col text-[#25384F] text-base md:text-xl leading-relaxed font-[AthelasBook] text-left gap-4"
                    dangerouslySetInnerHTML={{ __html: safe }}
                  />
                );
              })()}
              <button className="bg-[#F3E3DD] text-[#0e2a48] px-12 py-6 rounded-full font-medium text-base md:text-xl">
                book me
              </button>
            </div>
          ) : null}
        </LoadingWrapper>
      </div>
      <Footer />
    </div>
  );
}
