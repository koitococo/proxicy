import { Elysia } from "elysia";
import { completionsApi } from "./completions";
import { usageQueryApi } from "./usage";
import { routes as adminRoutes } from "./admin";
import { checkSecretApi } from "./secret.ts";

export const routes = new Elysia()
  .group("/v1", (app) => {
    return app.use(completionsApi);
  })
  .use(checkSecretApi)
  .use(usageQueryApi)
  .use(adminRoutes);
