/**
 * Footer — site-wide footer with optional newsletter sign-up.
 *
 * Features:
 *  - Logo + copyright line.
 *  - Navigation link row that adapts responsively: full text labels on
 *    desktop/tablet, icon-only links (Lucide icons) on mobile.
 *  - Optional newsletter sign-up form (controlled by `showNewsletter`).
 *    The form POSTs `{ email, firstName, lastName }` to `/api/email` and
 *    displays inline success/error feedback.
 *
 * @prop showNewsletter - Whether to render the newsletter sign-up form (default: true).
 * @prop logoText       - Unused legacy prop; kept for API compatibility.
 */
import { Link } from "react-router";
import React from "react";
import { r2Image } from "~/utils/images";
import { useState } from "react";
import { useScreenSize } from "~/hooks/useScreenSize";
import {
  CircleUserRound,
  House,
  Mail,
  Mic,
  Newspaper,
  ShoppingBasket,
} from "lucide-react";

type FooterProps = {
  showNewsletter?: boolean;
  logoText?: string;
};

const footerLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Me" },
  { to: "/email", label: "Newsletters" },
  { to: "/speaking", label: "Speaking" },
  { to: "/contact", label: "Contact" },
  { to: "/shop", label: "Shop for Books" },
] as const;

export function Footer({
  showNewsletter = true,
  logoText = "KMW Logo • Design by author website",
}: FooterProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { isMobile, isTablet } = useScreenSize();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/email/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Failed to subscribe");
        return;
      }

      setStatus("success");
      setFirstName("");
      setLastName("");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

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
            {status === "success" ? (
              <div className="text-white text-xl font-[athelasbook] py-8">
                Thank you for subscribing!
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 justify-center items-center mt-2"
              >
                <div className="flex flex-col gap-8">
                  <div className="flex md:flex-row flex-col gap-4">
                    <input
                      className="px-8 py-4 rounded bg-white outline-[#E3D2CB] outline-offset-4"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                      className="px-8 py-4 rounded bg-white outline-[#E3D2CB] outline-offset-4"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    <input
                      className="px-8 py-4 rounded bg-white outline-[#E3D2CB] outline-offset-4"
                      placeholder="Email Address"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-8 flex-col">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="bg-[#e3d2cb] text-black font-[athelasbook] px-8 py-4 rounded-full text-2xl hover:underline hover:cursor-pointer disabled:opacity-50"
                    >
                      {status === "loading" ? "Signing up..." : "Sign Up"}
                    </button>
                    {status === "error" && (
                      <div className="text-red-300 text-white font-[athelasbook]">
                        {errorMessage}
                      </div>
                    )}
                    <div className="text-l tracking-wide mb-4 text-white font-[athelasbook] w-fit">
                      I respect your privacy.
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>
      )}
      <footer className="bg-[#25384f] text-white py-8 text-sm">
        <div className="container mx-auto px-3 sm:px-6 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div>
            <Link to="/">
              <img
                src={"photos/author_logo.png"}
                alt="Author logo of a fairy and the name Karen MacLeod-Wilkie"
                className="w-32 h-12 cursor-pointer"
                loading="lazy"
              />
            </Link>
          </div>
          <div className="flex grow-3 gap-3 text-[#E3D2CB] text-xl justify-center">
            {!isMobile ? (
              <div className="flex gap-3">
                {footerLinks.map((link, index) => (
                  <React.Fragment key={link.to}>
                    <Link
                      to={link.to}
                      prefetch="intent"
                      className="hover:underline hover:cursor-pointer"
                    >
                      {isTablet ? link.label.split(" ")[0] : link.label}
                    </Link>
                    {footerLinks.length - 1 !== index && "|"}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="flex gap-8 p-8">
                <Link to="/" prefetch="intent">
                  <House />
                </Link>
                <Link
                  to="/about"
                  prefetch="intent"
                  className="flex gap-8 stroke-white"
                >
                  <CircleUserRound />
                </Link>
                <Link to="/emails" prefetch="intent">
                  <Newspaper />
                </Link>
                <Link to="/speaking" prefetch="intent">
                  <Mic />
                </Link>
                <Link to="/contact" prefetch="intent">
                  <Mail />
                </Link>
                <Link to="/shop" prefetch="intent">
                  <ShoppingBasket />
                </Link>
              </div>
            )}
          </div>
          <div className="flex min-w-32" />
        </div>
        <div className="flex w-full pb-4 md:p-4 items-center justify-center">
          <div className="text-l">
            Website by
            <Link
              to="https://ashegreen.ca/"
              target="/blank"
              className="text-[#E3D2CB] hover:underline hover:cursor-pointer"
            >
              {" "}
              Ashe Green Design{" "}
            </Link>
            and
            <Link
              to="https://www.linkedin.com/in/nicholasrwilkie/"
              target="/blank"
              className="text-[#E3D2CB] hover:underline hover:cursor-pointer"
            >
              {" "}
              Nicholas Wilkie
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
