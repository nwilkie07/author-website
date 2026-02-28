import type { Route } from "./+types/api.email";
import { MailchimpService } from "../services/mailchimp";

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const campaignId = url.searchParams.get("campaignId");

  if (!campaignId) {
    return new Response(JSON.stringify({ error: "campaignId required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = context.cloudflare.env.MAIL_CHIMP_API;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const mailchimp = new MailchimpService(apiKey);
    const content = await mailchimp.getCampaignContent(campaignId);

    if (!content) {
      return new Response(JSON.stringify({ error: "Failed to fetch content" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ content }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch campaign content:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch content" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
