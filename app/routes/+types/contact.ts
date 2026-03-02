export interface Route {
  MetaArgs: Record<string, unknown>;
  LoaderArgs: {
    context: {
      cloudflare: {
        env: {
          DB: any;
          VALUE_FROM_CLOUDFLARE: string;
        };
      };
    };
  };
  ActionArgs: {
    request: Request;
    context: any;
  };
  ComponentProps: {
    loaderData: {
      message: string;
      pageContent: Array<{
        id: number;
        page: string;
        title: string;
        description: string | null;
        created_at: string;
        updated_at: string;
      }>;
    };
  };
};
