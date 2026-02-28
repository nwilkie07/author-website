declare module "mailchimp" {
  interface CampaignSettings {
    subject_line: string;
    title: string;
    from_name: string;
    reply_to: string;
  }

  interface Campaign {
    id: string;
    web_id: number;
    type: string;
    create_time: string;
    archive_url: string;
    status: string;
    emails_sent: number;
    send_time: string | null;
    content_updated: string;
    settings: CampaignSettings;
  }

  interface CampaignContent {
    html: string;
  }

  interface CampaignsMethod {
    (options?: {
      start?: number;
      limit?: number;
      sort_field?: string;
      sort_dir?: string;
      type?: string;
      status?: string;
    }): Promise<Campaign[]>;
  }

  interface CampaignContentMethod {
    (campaignId: string): Promise<CampaignContent>;
  }

  interface Mailchimp {
    campaigns: CampaignsMethod;
    campaignContent: CampaignContentMethod;
  }

  function Mailchimp(apiKey: string): Mailchimp;
  export = Mailchimp;
}
