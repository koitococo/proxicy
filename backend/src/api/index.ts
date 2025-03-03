import { Elysia } from "elysia";
import { completionsApi } from "./completions";
import { usageQueryApi } from "./usage";
import { routes as adminRoutes } from "./admin";

export const routes = new Elysia()
  .group("/v1", (app) => {
    return app.use(completionsApi);
  })
  .use(usageQueryApi)
  .use(adminRoutes);
