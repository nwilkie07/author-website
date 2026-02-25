import { Link } from "react-router";
import { r2Image } from "../utils/images";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import type { PageContent } from "~/types/db";
import { SkeletonImage, SkeletonLine } from "../components/Skeleton";
import { LoadingWrapper } from "../components/LoadingWrapper";

export default function About({
  message,
  pageContent = [],
}: {
  message: string;
  pageContent?: PageContent[];
}) {
  // Loading wrapper around the entire content to standardize UX
  const isLoading = !pageContent || pageContent.length === 0;
  return (
    <LoadingWrapper isLoading={isLoading} variant="section" skeletonCount={3}>
      {!isLoading && (
        <>
          <Navbar activePath="/about" />
          <section className="bg-[#426685] py-20 relative">
            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-2xl md:text-4xl text-[#E3D2CB] font-[IvyModeSemiBold] mb-6 text-left">
                  {pageContent[0].title}
                </div>
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
                      className="flex flex-col text-white text-base md:text-xl leading-relaxed font-[AthelasBook] text-center md:text-left gap-8"
                      dangerouslySetInnerHTML={{ __html: safe }}
                    />
                  );
                })()}
              </div>
              <div className="flex items-center justify-center">
                <div>
                  <img
                    src={r2Image("static_photos/about.webp")}
                    alt="Author"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </section>
          <Footer logoText="KMW Logo • Design-web-io.png" />
        </>
      )}
    </LoadingWrapper>
  );
}
