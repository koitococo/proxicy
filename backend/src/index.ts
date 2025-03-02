import { Elysia } from "elysia";
import { routes } from "./api";
import { opentelemetry } from "@elysiajs/opentelemetry";

new Elysia()
	.use(opentelemetry())
  .use(routes)
	.listen(3000);
