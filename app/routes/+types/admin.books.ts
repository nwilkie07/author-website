export type Route = {
  MetaArgs: Record<string, unknown>;
  LoaderArgs: {
    context: {
      cloudflare: {
        env: {
          DB: any;
          VALUE_FROM_CLOUDFLARE?: string;
          IMAGES_BUCKET: any;
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
