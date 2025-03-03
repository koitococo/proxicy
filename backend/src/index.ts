import { Elysia } from "elysia";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { routes } from "@/api";
import { loggerPlugin } from "@/plugins/loggerPlugin";

const port = process.env.PORT || 3000;

const app = new Elysia()
  .use(loggerPlugin)
  .use(opentelemetry())
  .use(routes)
  .listen(port);

export type App = typeof app;
