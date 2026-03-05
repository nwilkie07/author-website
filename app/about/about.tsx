import { Suspense } from "react";
import { Await } from "react-router";
import { r2Image } from "../utils/images";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import type { PageContent } from "~/types/db";
import LoadingWrapper from "~/components/LoadingWrapper";

export default function About({
  message,
  pageContent,
}: {
  message: string;
  pageContent: PageContent[] | Promise<PageContent[]>;
}) {
  return (
    <>
      <Navbar activePath="/about" />
      <section className="bg-[#426685] py-20 relative">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <Suspense fallback={<LoadingWrapper variant="section" skeletonCount={1} />}>
            <Await resolve={pageContent}>
              {(resolvedContent) => {
                if (!resolvedContent || resolvedContent.length === 0) return null;
                const raw = resolvedContent[0].description ?? "";
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
                  <div>
                    <div className="text-2xl md:text-4xl text-[#E3D2CB] font-[IvyModeSemiBold] mb-6 text-left">
                      {resolvedContent[0].title}
                    </div>
                    <div
                      className="flex flex-col text-white text-base md:text-xl leading-relaxed font-[AthelasBook] text-center md:text-left gap-8"
                      dangerouslySetInnerHTML={{ __html: safe }}
                    />
                  </div>
                );
              }}
            </Await>
          </Suspense>
          <div className="flex items-center justify-center">
            <div>
              <img
                src={r2Image("static_photos/about.webp")}
                alt="Two books, The Prophecy and Fresh Start by Karen MacLeod-Wilkie are stacked on top of each other on a wooden table in a brightly lit environment. A figurine of a fairy sitting and thinking sits atop the stack of books."
                className="w-full h-full"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>
      <Footer logoText="KMW Logo • Design-web-io.png" />
    </>
  );
}
