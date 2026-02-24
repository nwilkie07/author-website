import { Link } from "react-router";

type NavbarProps = {
  activePath?: "/" | "/about" | "/speaking" | "/contact" | "/shop";
  authorName?: string;
};

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/speaking", label: "Speaking" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar({ activePath, authorName = "Author Name Here" }: NavbarProps) {
  return (
    <header className="bg-[#25384f] text-white py-4">
      <div className="container mx-auto px-6 flex items-center justify-between p-12">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg tracking-wide">{authorName}</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm uppercase tracking-wider">
          {navLinks.map((link) => {
              const underline = activePath === link.to ? "underline" : "hover:underline"

           return(<Link
              key={link.to}
              to={link.to}
              className={`${underline} text-[#F3E3DD] text-2xl`}
            >
              {link.label}
            </Link>)
})}
        </nav>
        <Link
          to="/shop"
          className="bg-[#F3E3DD] text-[#0e2a48] px-8 py-4 rounded-full text-sm"
        >
          Shop For Books
        </Link>
      </div>
    </header>
  );
}
