import { Elysia } from "elysia";
import { completionsApi } from "./completions";
import { usageQuery } from "./usage";

export const routes = new Elysia().group("/v1", (app) => {
  return app.use(completionsApi).use(usageQuery);
});
