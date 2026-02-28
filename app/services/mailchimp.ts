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

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const CAMPAIGNS_CACHE_KEY = "mailchimp_campaigns";
const CONTENT_CACHE_PREFIX = "mailchimp_content_";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  getWithMetadata<T>(key: string): { data: T | null; timestamp: number } {
    const entry = this.cache.get(key);
    if (!entry) return { data: null, timestamp: 0 };

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      this.cache.delete(key);
      return { data: null, timestamp: 0 };
    }

    return { data: entry.data as T, timestamp: entry.timestamp };
  }

  setWithMetadata<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

const globalCache = new InMemoryCache();

export class MailchimpService {
  private apiKey: string;
  private serverPrefix: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.serverPrefix = apiKey.split("-").pop() || "us1";
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
    
    const cached = globalCache.get<MailchimpCampaign[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const data = await this.fetchMailchimp(`/campaigns?count=${limit}&sort_field=send_time&sort_dir=DESC&status=sent`);
      
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

      globalCache.set(cacheKey, campaigns);
      
      return campaigns;
    } catch (error) {
      console.error("Failed to fetch Mailchimp campaigns:", error);
      return [];
    }
  }

  async getCampaignContent(campaignId: string): Promise<string | null> {
    const cacheKey = `${CONTENT_CACHE_PREFIX}${campaignId}`;
    
    const cached = globalCache.get<string>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const data = await this.fetchMailchimp(`/campaigns/${campaignId}/content`);
      const content = data.html || null;
      
      if (content) {
        globalCache.set(cacheKey, content);
      }
      
      return content;
    } catch (error) {
      console.error(`Failed to fetch content for campaign ${campaignId}:`, error);
      return null;
    }
  }

  async refreshCampaigns(limit: number = 10): Promise<MailchimpCampaign[]> {
    const cacheKey = `${CAMPAIGNS_CACHE_KEY}_${limit}`;
    
    globalCache.delete(cacheKey);
    return this.getCampaigns(limit);
  }

  async refreshCampaignContent(campaignId: string): Promise<string | null> {
    const cacheKey = `${CONTENT_CACHE_PREFIX}${campaignId}`;
    
    globalCache.delete(cacheKey);
    return this.getCampaignContent(campaignId);
  }

  async subscribe(listId: string, email: string, firstName: string, lastName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const data = await this.fetchMailchimp(`/lists/${listId}/members`, {
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
