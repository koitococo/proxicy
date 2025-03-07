import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { serverTiming } from "@elysiajs/server-timing";
import { routes } from "@/api";
import { loggerPlugin } from "@/plugins/loggerPlugin";
import { ALLOWED_ORIGINS, PORT, PRODUCTION } from "@/utils/config";

const app = new Elysia()
  .use(loggerPlugin)
  .use(
    cors({
      origin: ALLOWED_ORIGINS,
    }),
  )
  .use(
    swagger({
      documentation: {
        components: {
          securitySchemes: {
            adminSecret: {
              type: "http",
              scheme: "bearer",
            },
            apiKey: {
              type: "http",
              scheme: "bearer",
            },
          },
        },
        info: {
          title: "NexusGate API Documentation",
          version: "0.0.1",
        },
      },
    }),
  )
  .use(serverTiming())
  .use(routes)
  .listen({
    port: PORT,
    reusePort: PRODUCTION,
    hostname: "0.0.0.0",
  });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
