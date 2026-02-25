export namespace Route {
  export type LoaderArgs = { context: { cloudflare: { env: any } } };
  export type ActionArgs = { request: any; context: { cloudflare: { env: any } } };
  export type ComponentProps = { loaderData: any; actionData?: any };
  export type MetaArgs = any;
}
