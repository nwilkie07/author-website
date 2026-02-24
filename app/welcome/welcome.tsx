import { Link } from "react-router";
import { r2Image } from "../utils/images";
import type { BookWithPurchaseLinks } from "../types/db";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export function Welcome({ message, books = [] }: { message: string; books?: BookWithPurchaseLinks[] }) {
  const displayBooks = books.length > 0 ? books : [
    { id: 0, name: "Book 1", image_url: r2Image("books/book-1.jpg"), description: null, created_at: "", updated_at: "", purchase_links: [] },
    { id: 1, name: "Book 2", image_url: r2Image("books/book-2.jpg"), description: null, created_at: "", updated_at: "", purchase_links: [] },
    { id: 2, name: "Book 3", image_url: r2Image("books/book-3.jpg"), description: null, created_at: "", updated_at: "", purchase_links: [] },
    { id: 3, name: "Book 4", image_url: r2Image("books/book-4.jpg"), description: null, created_at: "", updated_at: "", purchase_links: [] },
    { id: 4, name: "Book 5", image_url: r2Image("books/book-5.jpg"), description: null, created_at: "", updated_at: "", purchase_links: [] },
    { id: 5, name: "Book 6", image_url: r2Image("books/book-6.jpg"), description: null, created_at: "", updated_at: "", purchase_links: [] },
  ];

  return (
    <div>
      <Navbar activePath="/" />

      <section className="relative h-[520px] bg-center bg-cover" style={{
        backgroundImage: `url('${r2Image("static_photos/home_background.jpg")}')`
      }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-4xl mx-auto h-full flex items-center">
          <div className="text-white space-y-6 pl-6 md:pl-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight drop-shadow-md w-full" style={{ lineHeight: 1.1 }}>
              Let’s transport you to another time and place…
            </h1>
            <button className="bg-[#F3E3DD] text-[#0e2a48] px-12 py-6 rounded-full font-large text-2xl">view all books</button>
          </div>
        </div>
      </section>

      <section className="bg-[#f1d9cf] pt-12 pb-20 relative">
        <svg viewBox="0 0 1440 320" className="absolute left-0 bottom-0 w-full" preserveAspectRatio="none" style={{ height: 120 }}>
          <path fill="#0e2a48" d="M0,224L60,240C120,256,240,288,360,272C480,256,600,192,720,181.3C840,171,960,213,1080,234.7C1200,256,1320,256,1380,240L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-start relative z-10">
          <div className="order-2 md:order-1 flex items-start md:items-center space-x-4 md:space-x-8">
            <div className="text-blue-700 font-semibold leading-tight" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
              More great reads coming soon
            </div>
            <div className="flex-1 grid sm:grid-cols-2 md:grid-cols-3 gap-6 pt-6">
              {displayBooks.map((b, idx) => (
                <div key={b.id || idx} className="rounded shadow-md overflow-hidden bg-white">
                  <img src={b.image_url} alt={b.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 md:order-2 flex items-center justify-center">
            <button className="bg-blue-700 text-white px-6 py-3 rounded-full">Shop Now</button>
          </div>
        </div>
      </section>

      <section className="bg-[#f4e6df] pt-20 pb-28">
        <div className="container mx-auto px-6 grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <p className="text-2xl md:text-3xl text-[#0e2a48]">Welcome to my adventures in writing.</p>
          </div>
          <div className="md:col-span-7">
            <p className="text-gray-700 leading-relaxed">I write fantasy fiction for curious audiences who value friendship and respect in a variety of relationships. My quirky characters will lead you into adventure in contemporary and fantastical worlds. Through their eyes explore real life issues with a touch of humour and warmth and feel how their healing experiences unfold.</p>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 border-t border-gray-200 text-center text-sm text-gray-500">
        <blockquote className="mx-auto max-w-3xl italic">"The characters in the book are amazing! The mix of personalities and acceptance of each other's differences is just wonderful. It will have you hooked from the first page. Can't wait for the next one to be available."</blockquote>
        <div className="mt-4">— Jonh Doe. • A Verified Amazon Purchase of the Book</div>
      </section>

      <Footer />
    </div>
  );
}
