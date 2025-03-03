import Elysia, { t } from "elysia";
import { apiKeyPlugin } from "@/plugins/apiKeyPlugin";
import { adminApiKey } from "./apiKey";
import { adminUpstream } from "./upstream";

export const routes = new Elysia({
  detail: {
    security: [{ bearerAuth: [] }],
  },
})
  .use(apiKeyPlugin)
  .group("/admin", (app) =>
    app.guard({ checkAdminApiKey: true }, (app) =>
      app
        .use(adminApiKey)
        .use(adminUpstream)
        .get("/", () => true, { detail: { description: "Check whether the admin secret is valid." } }),
    ),
  );
