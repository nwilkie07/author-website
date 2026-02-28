import type { Route } from "./+types/emails";
import {
  MailchimpService,
  type MailchimpCampaign,
} from "../services/mailchimp";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useState, useEffect } from "react";
import { parseMailchimpContent } from "~/utils/parseEmailContent";


function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return html;
  try {
    // @ts-ignore
    const lib = require("dompurify");
    const sanitizer = lib?.default?.sanitize ?? lib?.sanitize ?? ((s: string) => s);
    return sanitizer(html);
  } catch {
    return html;
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Emails & Newsletters" },
    { name: "description", content: "Read past newsletters" },
  ];
}

const dateOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

export async function loader({ context }: Route.LoaderArgs) {
  const apiKey = context.cloudflare.env.MAIL_CHIMP_API;

  if (!apiKey) {
    return { campaigns: [], error: "Mailchimp API key not configured" };
  }

  try {
    const mailchimp = new MailchimpService(apiKey);
    const campaigns = await mailchimp.getCampaigns();
    return { campaigns, error: null };
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return { campaigns: [], error: "Failed to fetch campaigns" };
  }
}

function EmailModal({
  campaign,
  isOpen,
  onClose,
}: {
  campaign: MailchimpCampaign;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || content) return;

    const loadContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/email?campaignId=${encodeURIComponent(campaign.id)}`,
        );
        const data: { error?: string; content?: string } =
          await response.json();

        if (data.error) {
          console.error("Failed to load email:", data.error);
          return;
        }

        setContent(sanitizeHtml(data.content || ""));
      } catch (error) {
        console.error("Failed to load email content:", error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [isOpen, campaign.id]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[#25384F]">
              {campaign.send_time
                ? new Date(campaign.send_time).toLocaleDateString(
                    [],
                    dateOptions,
                  ) + " Newsletter"
                : "Draft"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="p-6">
          {loading && (
            <div className="text-center py-8 text-gray-500">
              Loading content...
            </div>
          )}
          {content && (
            <div
              className="email-content prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Emails({ loaderData }: Route.ComponentProps) {
  const { campaigns, error } = (loaderData as {
    campaigns: MailchimpCampaign[];
    error: string | null;
  }) || { campaigns: [], error: null };
  const [selectedCampaign, setSelectedCampaign] =
    useState<MailchimpCampaign | null>(null);

  return (
    <div>
      <Navbar activePath="/emails" />

      <section className="py-12 bg-[#F8E7DE]">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl mb-6 text-[#25384F] font-[IvyModeBold]">
            Newsletters
          </h1>
          <p className="text-lg text-[#25384F] max-w-2xl mx-auto">
            Browse through past newsletters.
          </p>
        </div>
      </section>

      <section className="py-12 border-t-[4px] bg-[#F8E7DE] border-[#25384F]">
        <div className="container mx-auto px-6">
          {error && (
            <div className="text-center text-red-500 py-8">{error}</div>
          )}

          {!error && campaigns.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No emails found.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                onClick={() => setSelectedCampaign(campaign)}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left hover:cursor-pointer hover:shadow-lg"
              >
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    {campaign.send_time
                      ? new Date(campaign.send_time).toLocaleDateString(
                          [],
                          dateOptions,
                        ) + " Newsletter"
                      : campaign.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedCampaign && (
        <EmailModal
          campaign={selectedCampaign}
          isOpen={true}
          onClose={() => setSelectedCampaign(null)}
        />
      )}

      <Footer showNewsletter={true} />
    </div>
  );
}
