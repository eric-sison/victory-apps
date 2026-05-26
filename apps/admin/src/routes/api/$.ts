import { createFileRoute } from "@tanstack/react-router";
import { app } from "#/server/app";

const serve = async ({ request }: { request: Request }) => {
  return app.fetch(request);
};

// Route all api requests to the hono server
export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: serve,
      POST: serve,
      PUT: serve,
      DELETE: serve,
      PATCH: serve,
      OPTIONS: serve,
      HEAD: serve,
    },
  },
});
