import { createRequestHandler } from "react-router";

const requestHandler = createRequestHandler(
  // @ts-expect-error virtual module
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  fetch(request: Request, env: Record<string, unknown>, ctx: ExecutionContext) {
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler;
