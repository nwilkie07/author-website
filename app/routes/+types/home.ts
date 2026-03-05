import type { BookWithPurchaseLinks, PageContent, Testimonial } from "~/types/db";

export type Route = {
  MetaArgs: Record<string, unknown>;
  LoaderArgs: {
    context: {
      cloudflare: {
        env: Env;
        ctx: ExecutionContext;
      };
    };
  };
  ComponentProps: {
    loaderData: {
      message: string;
      books: Promise<BookWithPurchaseLinks[]>;
      pageContent: Promise<PageContent[]>;
      testimonials: Promise<Testimonial[]>;
    };
  };
};
