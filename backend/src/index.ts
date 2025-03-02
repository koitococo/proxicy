import { Elysia } from "elysia";
import { routes } from "./api";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { loggerPlugin } from "./plugins/loggerPlugin";

const port = process.env.PORT || 3000;

new Elysia()
  .use(loggerPlugin)
	.use(opentelemetry())
	.use(routes)
	.listen(port);
