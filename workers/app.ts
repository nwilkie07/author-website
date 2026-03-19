/**
 * Cloudflare Worker entry point.
 *
 * This file is the top-level fetch handler that Cloudflare invokes for every
 * incoming HTTP request. It bridges the Cloudflare Workers runtime with the
 * React Router server build by:
 *
 *  1. Augmenting the `react-router` module to declare the shape of
 *     `AppLoadContext`, making `context.cloudflare.env` and
 *     `context.cloudflare.ctx` available with full TypeScript types inside
 *     every route loader and action.
 *
 *  2. Creating a single shared `requestHandler` from the React Router server
 *     build (the virtual module produced by the Vite build).
 *
 *  3. Exporting a `fetch` handler that passes the Cloudflare `env` and `ctx`
 *     bindings through as the load context so route modules can access D1,
 *     R2, KV, and Worker secrets without any global state.
 */
import { createRequestHandler } from "react-router";

// Extend react-router's AppLoadContext so that route loaders/actions get
// typed access to the Cloudflare env bindings and execution context.
declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

// Build the React Router request handler once at module load time (not per
// request) so it can be reused across multiple invocations within the same
// Worker isolate lifetime.
const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  /**
   * Main fetch handler — called by the Cloudflare Workers runtime for every
   * HTTP request routed to this Worker.
   *
   * Passes the Cloudflare `env` (bindings: DB, R2, KV, secrets) and `ctx`
   * (execution context, used for waitUntil) into the React Router load
   * context so they are accessible in all route loaders and actions.
   */
  async fetch(request, env, ctx) {
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
