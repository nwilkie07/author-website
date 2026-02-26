export type Route = {
  MetaArgs: {};
  LoaderArgs: {
    context: {
      cloudflare: {
        env: {
          DB: string;
          VALUE_FROM_CLOUDFLARE?: string;
        };
      };
    };
  };
  ActionArgs: { request: any; context: { cloudflare: { env: any } } };
  ComponentProps: {
    loaderData: any;
    actionData?: any;
  };
};
