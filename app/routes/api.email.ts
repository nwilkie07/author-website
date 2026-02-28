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

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = context.cloudflare.env.MAIL_CHIMP_API;
  const listId = (context.cloudflare.env as any).MAIL_CHIMP_LIST_ID;

  if (!apiKey || !listId) {
    return new Response(JSON.stringify({ error: "API key or list ID not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json() as { email?: string; firstName?: string; lastName?: string };
    const { email, firstName, lastName } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const mailchimp = new MailchimpService(apiKey);
    const result = await mailchimp.subscribe(listId, email, firstName || "", lastName || "");

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to subscribe:", error);
    return new Response(JSON.stringify({ error: "Failed to subscribe" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
