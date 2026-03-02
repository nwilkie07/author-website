export type Route = {
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
  ComponentProps: {
    loaderData: any;
  };
};
