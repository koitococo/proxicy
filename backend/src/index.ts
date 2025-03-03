import { Elysia } from "elysia";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { routes } from "@/api";
import { loggerPlugin } from "@/plugins/loggerPlugin";
import { PORT } from "@/utils/config";

const app = new Elysia()
  .use(loggerPlugin)
  .use(opentelemetry())
  .use(routes)
  .listen(PORT);

export type App = typeof app;
