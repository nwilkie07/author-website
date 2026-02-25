import { Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import type { PageContent } from "~/types/db";
import { LoadingWrapper } from "../components/LoadingWrapper";
import { sanitizeHTML } from "../utils/sanitizeHTML";

// Simple, clean Contact page that uses a LoadingWrapper for uniform UX
export default function Contact({
  message,
  pageContent = [],
}: {
  message: string;
  pageContent?: PageContent[];
}) {
  const isLoading = !pageContent || pageContent.length === 0;
  const content = pageContent[0] ?? null;

  return (
    <LoadingWrapper isLoading={isLoading} variant="section" skeletonCount={3}>
      {!isLoading && content && (
        <>
          <Navbar activePath="/contact" authorName="Karen MacLeod-Wilkie" />
          <section className="bg-[#f4e6df] py-12">
            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="text-2xl md:text-4xl text-[#25384F] font-[IvyModeBold] mb-6 text-left">{content.title}</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md">
                  <div className="text-[#25384F] text-base md:text-xl leading-relaxed font-[AthelasBook] mb-4" dangerouslySetInnerHTML={{ __html: sanitizeHTML(content.description ?? "") }} />
                  <div className="w-full flex gap-8" aria-label="social-links">
                    <a href="https://www.facebook.com/karenmacleodwilkiewriter" aria-label="Facebook" rel="noreferrer" target="_blank">
                      <svg width="80" height="80" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.53906C17.5229 2.53906 22 7.01621 22 12.5391C22 17.5304 18.3431 21.6674 13.5625 22.4176V15.4297H15.8926L16.3359 12.5391L13.5625 12.5387V10.6632C13.5625 10.657 13.5625 10.6509 13.5626 10.6447C13.5626 10.6354 13.5628 10.6262 13.5629 10.6169C13.578 9.84259 13.9742 9.10156 15.1921 9.10156H16.4531V6.64062C16.4531 6.64062 15.3087 6.44492 14.2146 6.44492C11.966 6.44492 10.4842 7.78652 10.4386 10.2193C10.4379 10.2578 10.4375 10.2965 10.4375 10.3355V12.5387H7.89844V15.4293L10.4375 15.4297V22.4172C5.65686 21.667 2 17.5304 2 12.5391C2 7.01621 6.47715 2.53906 12 2.53906Z" fill="#343C54"/>
                        </svg>
                    </a>
                    <a href="https://www.instagram.com/karenmacleodwilkiebooks/" aria-label="Instagram" rel="noreferrer" target="_blank">
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 17.5 22h-9A5.5 5.5 0 0 1 3 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9z" fill="#343C54"/>
                        <circle cx="12" cy="12" r="3.5" fill="#343C54"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <Footer />
        </>
      )}
    </LoadingWrapper>
  );
}
