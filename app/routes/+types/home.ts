export type Route = {
  MetaArgs: {};
  LoaderArgs: {
    context: {
      cloudflare: {
        env: {
          DB: string;
          VALUE_FROM_CLOUDFLARE: string;
        };
      };
    };
  };
  ComponentProps: {
    loaderData: any;
  };
};
