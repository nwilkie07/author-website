import { Link } from "react-router";
import { useState } from "react";
import { r2Image } from "~/utils/images";

type NavbarProps = {
  activePath?: "/" | "/about" | "/emails" | "/speaking" | "/contact" | "/shop";
  authorName?: string;
};

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Me" },
  { to: "/emails", label: "Newsletters" },
  { to: "/speaking", label: "Speaking" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar({ activePath }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="bg-[#25384f] text-white py-4 z-5">
      <div className="flex flex-column align-center p-4 gap-8">
        <img
          src={r2Image("static_photos/author_logo.png")}
          alt="author_logo"
          className="w-64 h-24"
        />

        <div className="container mx-auto px-6 flex items-center lg:justify-between justify-end">
          <nav className="hidden lg:flex gap-6 text-sm tracking-wider items-center">
            {navLinks.map((link) => {
              const underline =
                activePath === link.to ? "border-b-2" : "hover:border-b-2";

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`${underline} text-[#F3E3DD] text-xl font-[athelas-web] font-thin border-[#F3E3DD]`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <Link
            to="/shop"
            className="hidden lg:flex bg-[#F3E3DD] text-[#0e2a48] px-8 py-4 rounded-full text-sm hover:underline"
          >
            Shop For Books
          </Link>
          <button
            className="flex items-center justify-self-end gap-4 lg:hidden px-4 py-2 rounded-lg  hover:shadow-lg hover:cursor-pointer"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              transform="rotate(0 0 0)"
            >
              <path
                d="M20 7.125L4 7.125C3.37868 7.125 2.875 6.62132 2.875 6C2.875 5.37868 3.37868 4.875 4 4.875L20 4.875C20.6213 4.875 21.125 5.37868 21.125 6C21.125 6.62132 20.6213 7.125 20 7.125ZM20 13.125L4 13.125C3.37868 13.125 2.875 12.6213 2.875 12C2.875 11.3787 3.37868 10.875 4 10.875L20 10.875C20.6213 10.875 21.125 11.3787 21.125 12C21.125 12.6213 20.6213 13.125 20 13.125ZM20 19.125L4 19.125C3.37868 19.125 2.875 18.6213 2.875 18C2.875 17.3787 3.37868 16.875 4 16.875L20 16.875C20.6213 16.875 21.125 17.3787 21.125 18C21.125 18.6213 20.6213 19.125 20 19.125Z"
                fill="#F3E3DD"
              />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[#25384f] flex flex-col">
          <div className="flex justify-end p-4">
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="text-[#F3E3DD]"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                  fill="#F3E3DD"
                />
              </svg>
            </button>
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-8">
            {navLinks.map((link) => {
              const isActive = activePath === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-[#F3E3DD] text-3xl font-[athelas-web] font-thin ${isActive ? "opacity-50" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              to="/shop"
              className="bg-[#F3E3DD] text-[#0e2a48] px-8 py-3 rounded-full text-xl mt-4"
              onClick={() => setMenuOpen(false)}
            >
              Shop For Books
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
