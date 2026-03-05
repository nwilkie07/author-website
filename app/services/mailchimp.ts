export type MailchimpCampaign = {
  id: string;
  web_id: number;
  type: string;
  create_time: string;
  archive_url: string;
  status: string;
  emails_sent: number;
  send_time: string | null;
  content_updated: string;
  subject_line: string;
  title: string;
  from_name: string;
  reply_to: string;
};

const CAMPAIGNS_CACHE_KEY = "mailchimp_campaigns";
const CONTENT_CACHE_PREFIX = "mailchimp_content_";
// KV TTL in seconds (1 hour). KV handles expiry natively — no timestamp math needed.
const CACHE_TTL_SECONDS = 60 * 60;

export class MailchimpService {
  private apiKey: string;
  private serverPrefix: string;
  private kv: KVNamespace | null;

  constructor(apiKey: string, kv?: KVNamespace) {
    this.apiKey = apiKey;
    this.serverPrefix = apiKey.split("-").pop() || "us1";
    this.kv = kv ?? null;
  }

  private async fetchMailchimp(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `https://${this.serverPrefix}.api.mailchimp.com/3.0${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Basic ${btoa(`anystring:${this.apiKey}`)}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { detail?: string };
      throw new Error(errorData.detail || `Mailchimp API error: ${response.status}`);
    }

    return response.json();
  }

  async getCampaigns(limit: number = 10): Promise<MailchimpCampaign[]> {
    const cacheKey = `${CAMPAIGNS_CACHE_KEY}_${limit}`;

    // Check KV cache first
    if (this.kv) {
      try {
        const cached = await this.kv.get<MailchimpCampaign[]>(cacheKey, "json");
        if (cached) return cached;
      } catch (e) {
        console.error("KV get error (campaigns):", e);
      }
    }

    try {
      const data = await this.fetchMailchimp(
        `/campaigns?count=${limit}&sort_field=send_time&sort_dir=DESC&status=sent`
      );

      const campaigns: MailchimpCampaign[] = (data.campaigns || []).map((campaign: any) => ({
        id: campaign.id,
        web_id: campaign.web_id,
        type: campaign.type,
        create_time: campaign.create_time,
        archive_url: campaign.archive_url,
        status: campaign.status,
        emails_sent: campaign.emails_sent,
        send_time: campaign.send_time,
        content_updated: campaign.content_updated,
        subject_line: campaign.settings?.subject_line || "",
        title: campaign.settings?.title || "",
        from_name: campaign.settings?.from_name || "",
        reply_to: campaign.settings?.reply_to || "",
      }));

      // Write to KV cache (fire-and-forget; don't block the response)
      if (this.kv) {
        this.kv
          .put(cacheKey, JSON.stringify(campaigns), { expirationTtl: CACHE_TTL_SECONDS })
          .catch((e) => console.error("KV put error (campaigns):", e));
      }

      return campaigns;
    } catch (error) {
      console.error("Failed to fetch Mailchimp campaigns:", error);
      return [];
    }
  }

  async getCampaignContent(campaignId: string): Promise<string | null> {
    const cacheKey = `${CONTENT_CACHE_PREFIX}${campaignId}`;

    // Check KV cache first
    if (this.kv) {
      try {
        const cached = await this.kv.get(cacheKey, "text");
        if (cached) return cached;
      } catch (e) {
        console.error(`KV get error (content ${campaignId}):`, e);
      }
    }

    try {
      const data = await this.fetchMailchimp(`/campaigns/${campaignId}/content`);
      const content: string | null = data.html || null;

      // Write to KV cache (fire-and-forget)
      if (content && this.kv) {
        this.kv
          .put(cacheKey, content, { expirationTtl: CACHE_TTL_SECONDS })
          .catch((e) => console.error(`KV put error (content ${campaignId}):`, e));
      }

      return content;
    } catch (error) {
      console.error(`Failed to fetch content for campaign ${campaignId}:`, error);
      return null;
    }
  }

  async refreshCampaigns(limit: number = 10): Promise<MailchimpCampaign[]> {
    const cacheKey = `${CAMPAIGNS_CACHE_KEY}_${limit}`;
    if (this.kv) {
      await this.kv.delete(cacheKey).catch(() => {});
    }
    return this.getCampaigns(limit);
  }

  async refreshCampaignContent(campaignId: string): Promise<string | null> {
    const cacheKey = `${CONTENT_CACHE_PREFIX}${campaignId}`;
    if (this.kv) {
      await this.kv.delete(cacheKey).catch(() => {});
    }
    return this.getCampaignContent(campaignId);
  }

  /**
   * Pre-warms the KV cache with campaign list and content for all campaigns.
   * Only fetches from Mailchimp for entries that are not already cached.
   * Intended to be called via ctx.waitUntil() so it runs in the background
   * without blocking any page response.
   */
  async warmCache(limit: number = 10): Promise<void> {
    if (!this.kv) return;

    const campaigns = await this.getCampaigns(limit);
    await Promise.all(campaigns.map((c) => this.getCampaignContent(c.id)));
  }

  async subscribe(
    listId: string,
    email: string,
    firstName: string,
    lastName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.fetchMailchimp(`/lists/${listId}/members`, {
        method: "POST",
        body: JSON.stringify({
          email_address: email,
          status: "subscribed",
          merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
          },
        }),
      });

      return { success: true };
    } catch (error: any) {
      if (error.message && error.message.includes("already a list member")) {
        return { success: false, error: "This email is already subscribed" };
      }
      console.error("Failed to subscribe:", error);
      return { success: false, error: error.message || "Failed to subscribe" };
    }
  }
}
