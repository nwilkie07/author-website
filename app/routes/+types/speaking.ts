import type { PageContent } from "~/types/db";

export interface Route {
  MetaArgs: Record<string, unknown>;
  LoaderArgs: {
    context: {
      cloudflare: {
        env: Env;
        ctx: ExecutionContext;
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
      pageContent: Promise<PageContent[]>;
    };
  };
}
