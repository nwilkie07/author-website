import { Link } from "react-router";
import { r2Image } from "~/utils/images";

type FooterProps = {
  showNewsletter?: boolean;
  logoText?: string;
};

const footerLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Me" },
  { to: "/speaking", label: "Speaking" },
  { to: "/contact", label: "Contact" },
] as const;

export function Footer({
  showNewsletter = true,
  logoText = "KMW Logo • Design by author website",
}: FooterProps) {
  return (
    <>
      {showNewsletter && (
        <section className="bg-[#25384f] text-black py-12">
          <div className="container mx-auto px-6 text-center">
            <h3 className="text-xl tracking-wide mb-4 text-white font-[IvyModeSemiBold]">
              Newsletter Sign-up
            </h3>
            <div className="text-xl tracking-wide mb-4 text-white font-[athelasbook]">
              Sign up with your email address to receive news and updates.
            </div>
            <form className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-2">
              <div className="flex flex-col gap-8">
                <div className="flex gap-4">
                  <input
                    className="px-8 py-4 rounded bg-white"
                    placeholder="First Name"
                  />
                  <input
                    className="px-8 py-4 rounded bg-white"
                    placeholder="Last Name"
                  />
                  <input
                    className="px-8 py-4 rounded bg-white"
                    placeholder="Email Address"
                  />
                </div>
                <div className="flex items-center justify-center gap-8 flex-col">
                  <button className="bg-[#e3d2cb] text-black font-[athelasbook] px-8 py-4 rounded-full text-2xl">
                    Sign Up
                  </button>
                  <div className="text-l tracking-wide mb-4 text-white font-[athelasbook] w-fit">
                    I respect your privacy.
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>
      )}
      <footer className="bg-[#25384f] text-white py-8 text-sm">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <img
              src={r2Image("static_photos/author_logo.png")}
              alt="author_logo"
              className="w-32 h-12"
            />
          </div>
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
