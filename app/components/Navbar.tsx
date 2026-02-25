import { Link } from "react-router";
import { useState } from "react";
import { r2Image } from "~/utils/images";

type NavbarProps = {
  activePath?: "/" | "/about" | "/speaking" | "/contact" | "/shop";
  authorName?: string;
};

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Me" },
  { to: "/speaking", label: "Speaking" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar({ activePath }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="bg-[#25384f] text-white py-4">
      <div className="flex flex-column align-center p-4 gap-8">
      <img
        src={r2Image("static_photos/author_logo.png")}
        alt="author_logo"
        className="w-64 h-24"
      />

      <div className="container mx-auto px-6 flex items-center justify-between">
        <nav className="hidden md:flex gap-6 text-sm tracking-wider">
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
        <button
          className="md:hidden bg-[#F3E3DD] text-[#0e2a48] px-4 py-2 rounded-full"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          Menu
        </button>

        <Link
          to="/shop"
          className="bg-[#F3E3DD] text-[#0e2a48] px-8 py-4 rounded-full text-sm"
        >
          Shop For Books
        </Link>
      </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden container mx-auto px-6 pt-2 pb-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const underline =
                activePath === link.to ? "border-b-2" : "hover:border-b-2";
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`${underline} text-[#F3E3DD] text-xl font-[athelas-web] font-thin border-[#F3E3DD]`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link to="/shop" className="block bg-[#F3E3DD] text-[#0e2a48] px-4 py-2 rounded-full mt-2" onClick={() => setMenuOpen(false)}>Shop For Books</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
