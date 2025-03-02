import { Elysia } from "elysia";
import { completionsApi } from "./completions";

export const routes = new Elysia()
  .group("/v1", (app) => {
    return app.use(completionsApi);
  })
