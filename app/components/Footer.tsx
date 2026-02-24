import { Link } from "react-router";

type FooterProps = {
  showNewsletter?: boolean;
  logoText?: string;
};

const footerLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/shop", label: "Shop Books" },
] as const;

export function Footer({ showNewsletter = true, logoText = "KMW Logo • Design by author website" }: FooterProps) {
  return (
    <>
      {showNewsletter && (
        <section className="bg-[#0e2a48] text-white py-12">
          <div className="container mx-auto px-6 text-center">
            <h3 className="text-xl tracking-wide mb-4">Newsletter Sign-up</h3>
            <form className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-2">
              <input className="px-4 py-2 rounded" placeholder="First Name" />
              <input className="px-4 py-2 rounded" placeholder="Last Name" />
              <input className="px-4 py-2 rounded" placeholder="Email Address" />
              <button className="bg-white text-[#0e2a48] px-6 py-3 rounded-full">Sign Up</button>
            </form>
          </div>
        </section>
      )}
      <footer className="bg-[#0e2a48] text-white py-8 text-sm">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>{logoText}</div>
          <div className="flex gap-6">
            {footerLinks.map((link) => (
              <Link key={link.to} to={link.to} className="hover:underline">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
