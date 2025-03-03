import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { serverTiming } from "@elysiajs/server-timing";
import { routes } from "@/api";
import { loggerPlugin } from "@/plugins/loggerPlugin";
import { ALLOWED_ORIGINS, PORT } from "@/utils/config";

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
            bearerAuth: {
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
          title: "Proxicy API Documentation",
          version: "0.0.1",
        },
      },
    }),
  )
  .use(opentelemetry())
  .use(serverTiming())
  .use(routes)
  .listen(PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
