import Elysia from "elysia";
import { adminApiKey } from "./apiKey";

export const routes = new Elysia().group("/admin", (app) => {
  return app.use(adminApiKey);
});
