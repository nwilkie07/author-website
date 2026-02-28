import { Link } from "react-router";
import { r2Image } from "~/utils/images";
import { useState } from "react";

type FooterProps = {
  showNewsletter?: boolean;
  logoText?: string;
};

const footerLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Me" },
  { to: "/speaking", label: "Speaking" },
  { to: "/email", label: "Newsletters" },
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
                      className="px-8 py-4 rounded bg-white"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                      className="px-8 py-4 rounded bg-white"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    <input
                      className="px-8 py-4 rounded bg-white"
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
            <img
              src={r2Image("static_photos/author_logo.png")}
              alt="author_logo"
              className="w-32 h-12"
            />
          </div>
          <div className="flex grow-3 gap-3 text-[#E3D2CB] text-xl justify-center">
            {footerLinks.map((link, index) => (
              <>
                <Link
                  key={link.to}
                  to={link.to}
                  className="hover:underline hover:cursor-pointer"
                >
                  {link.label}
                </Link>
                {footerLinks.length - 1 !== index && "|"}
              </>
            ))}
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
