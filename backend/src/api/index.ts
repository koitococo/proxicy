import { Elysia } from "elysia";
import { completionsApi } from "./completions";
import { usageQueryApi } from "./usage";
import { routes as adminRoutes } from "./admin";

export const routes = new Elysia()
	.group("/v1", (app) => app.use(completionsApi))
	.group("/api", (app) => app.use(usageQueryApi).use(adminRoutes));
