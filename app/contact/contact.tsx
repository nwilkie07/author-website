import { Suspense, useState, useEffect } from "react";
import { Await } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import type { PageContent } from "~/types/db";
import LoadingWrapper from "~/components/LoadingWrapper";
import { sanitizeHTML } from "../utils/sanitizeHTML";
import { Facebook, Instagram } from "lucide-react";
import { r2Image } from "~/utils/images";
import { readFromCacheSync, usePageContentCache } from "~/hooks/useDataCache";

declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        "error-callback": () => void;
        "expired-callback": () => void;
      }) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export default function Contact({
  message,
  pageContent,
}: {
  message: string;
  pageContent: PageContent[] | Promise<PageContent[]>;
}) {
  const cachedPageContent = usePageContentCache("contact", pageContent,  1000 * 60 * 60);
  const cachedPageContentSync = readFromCacheSync<PageContent[]>("pageContent_v1_contact");
  
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [messageText, setMessageText] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (window.turnstile) {
      window.turnstile.render("#turnstile-container", {
        sitekey: "0x4AAAAAAADLtFmEW1iKj5Xy",
        callback: (token: string) => {
          setTurnstileToken(token);
        },
        "error-callback": () => {
          setErrorMessage("Failed to load captcha. Please try again.");
        },
        "expired-callback": () => {
          setTurnstileToken("");
        },
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    if (!turnstileToken) {
      setStatus("error");
      setErrorMessage("Please complete the captcha verification.");
      return;
    }

    try {
      const response = await fetch("/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${fname} ${lname}`.trim(),
          email,
          message: messageText,
          "cf-turnstile-response": turnstileToken,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Failed to send message");
        if (window.turnstile) {
          window.turnstile.reset();
          setTurnstileToken("");
        }
        return;
      }

      setStatus("success");
      setFname("");
      setLname("");
      setEmail("");
      setMessageText("");
      setTurnstileToken("");
    } catch (error) {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Navbar activePath="/contact" authorName="Karen MacLeod-Wilkie" />
      <section className="bg-[#f4e6df] pt-12">
        {cachedPageContentSync ? (
          (() => {
            const resolvedContent = cachedPageContentSync;
            if (!resolvedContent || resolvedContent.length === 0) return null;
            return (
              <div className="container mx-auto px-6 flex flex-col w-full justify-center gap-8 items-center">
                <div className="space-y-4 self-start">
                  <div className="text-2xl md:text-4xl text-[#25384F] font-[IvyModeBold] mb-6 text-left">
                    {resolvedContent[0].title}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex flex-col w-full gap-4">
                    <div
                      className="flex text-[#25384F] text-base md:text-xl leading-relaxed gap-16 font-[AthelasBook] mb-4"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHTML(resolvedContent[0].description ?? ""),
                      }}
                    />
                    <div className="w-full flex gap-4" aria-label="social-links">
                      <a
                        href="https://www.facebook.com/karenmacleodwilkiewriter"
                        aria-label="Facebook"
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Facebook width={40} height={40} className="stroke-[#25384f]" />
                      </a>
                      <a
                        href="https://www.instagram.com/karenmacleodwilkiebooks/"
                        aria-label="Instagram"
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Instagram width={40} height={40} className="stroke-[#25384f]" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <Suspense
            fallback={
              <LoadingWrapper variant="grid" skeletonCount={2} className="grid-cols-2 m-6" />
            }
          >
            <Await resolve={cachedPageContent}>
              {(resolvedContent) =>
                resolvedContent && resolvedContent.length > 0 ? (
                  <div className="container mx-auto px-6 flex flex-col w-full justify-center gap-8 items-center">
                    <div className="space-y-4 self-start">
                      <div className="text-2xl md:text-4xl text-[#25384F] font-[IvyModeBold] mb-6 text-left">
                        {resolvedContent[0].title}
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="flex flex-col w-full gap-4">
                        <div
                          className="flex text-[#25384F] text-base md:text-xl leading-relaxed gap-16 font-[AthelasBook] mb-4"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHTML(resolvedContent[0].description ?? ""),
                          }}
                        />
                        <div className="w-full flex gap-4" aria-label="social-links">
                          <a
                            href="https://www.facebook.com/karenmacleodwilkiewriter"
                            aria-label="Facebook"
                            rel="noreferrer"
                            target="_blank"
                          >
                            <Facebook width={40} height={40} className="stroke-[#25384f]" />
                          </a>
                          <a
                            href="https://www.instagram.com/karenmacleodwilkiebooks/"
                            aria-label="Instagram"
                            rel="noreferrer"
                            target="_blank"
                          >
                            <Instagram width={40} height={40} className="stroke-[#25384f]" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null
              }
            </Await>
          </Suspense>
        )}
        <img
          src={"photos/footer_three.png"}
          alt="Footer illustration"
          className="w-full"
          loading="lazy"
        />
        <div className="flex w-full justify-center bg-[#25384F] w-[50%] p-8 md:pt-8">
          {status === "success" ? (
            <div className="text-[#25384F] text-xl font-[AthelasBook] py-8">
              Thank you!
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="form-wrapper max-w-[800px] flex flex-col grow-1"
              noValidate
            >
              <div className="field-list flex flex-col gap-4">
                <legend className="title">
                  <div className="font-[athelas] text-2xl">Contact Form</div>
                </legend>
                <div className="flex w-full gap-4">
                  <div className="field first-name flex flex-col w-full gap-2">
                    <label className="caption" htmlFor="fname-field">
                      <div className="flex gap-2 font-[athelasbook] items-center font-[athelasbook]">
                        <span className="text-xl">First Name</span>
                        <span className="text-l text-[#bec3cb]">(required)</span>
                      </div>
                    </label>
                    <input
                      aria-invalid="false"
                      aria-required="true"
                      autoComplete="given-name"
                      id="fname-field"
                      name="fname"
                      type="text"
                      value={fname}
                      onChange={(e) => setFname(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded bg-white outline-[#E3D2CB] outline-offset-4 text-black"
                    />
                  </div>
                  <div className="field last-name flex flex-col w-full gap-2">
                    <label className="caption" htmlFor="lname-field">
                      <div className="flex gap-2 font-[athelasbook] items-center font-[athelasbook]">
                        <span className="font-[athelasbook] text-xl">Last Name</span>
                        <span className="text-l text-[#bec3cb]">(required)</span>
                      </div>
                    </label>
                    <input
                      aria-invalid="false"
                      aria-required="true"
                      autoComplete="family-name"
                      id="lname-field"
                      name="lname"
                      type="text"
                      value={lname}
                      onChange={(e) => setLname(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded bg-white outline-[#E3D2CB] outline-offset-4 text-black"
                    />
                  </div>
                </div>
                <div className="form-item field email required flex flex-col gap-2">
                  <label htmlFor="email-field" className="title">
                    <div className="flex gap-2 font-[athelasbook] items-center">
                      <span className="text-xl">Email</span>
                      <span className="text-[#bec3cb] text-l">(required)</span>
                    </div>
                  </label>
                  <input
                    aria-invalid="false"
                    aria-required="true"
                    id="email-field"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded bg-white outline-[#E3D2CB] outline-offset-4 text-black"
                  />
                </div>
                <div className="form-item field textarea required flex flex-col gap-2">
                  <label htmlFor="message-field" className="title">
                    <div>
                      <span className="font-[athelasbook]">Message (required)</span>
                    </div>
                  </label>
                  <textarea
                    id="message-field"
                    aria-invalid="false"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded h-32 bg-white outline-[#E3D2CB] outline-offset-4 text-black"
                  />
                </div>
                <div className="flex justify-center my-4">
                  <div id="turnstile-container"></div>
                </div>
              </div>
              {status === "error" && (
                <div className="text-red-600 text-sm mt-2">{errorMessage}</div>
              )}
              <div className="form-button-wrapper form-button-wrapper--align-left mt-4">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="button sqs-system-button sqs-editable-button form-submit-button bg-[#E3D2CB] text-black text-lg px-12 py-4 mt-4 rounded-full hover:bg-opacity-90 disabled:opacity-50"
                >
                  {status === "loading" ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
      <Footer showNewsletter={false} />
    </>
  );
}
