import { Elysia, t } from "elysia";

import { apiKeyPlugin } from "../plugins/apiKeyPlugin";
import { consola } from "consola";
import { queryUsage } from "../utils/completions";

const logger = consola.withTag("usageQuery");

export const usageQueryApi = new Elysia({
  detail: {
    security: [{ bearerAuth: [] }],
  },
})
  .use(apiKeyPlugin)
  .get(
    "/usage",
    async ({ error, query: { userKey } }) => {
      if (userKey === undefined) {
        return error(400, "missing user key");
      }
      logger.log("queryUsage", userKey);
      return queryUsage(userKey);
    },
    {
      checkApiKey: true,
      query: t.Object({
        userKey: t.String(),
      }),
    },
  );
