import { Elysia, t } from "elysia";

import { apiKeyPlugin } from "../plugins/apiKeyPlugin";
import { consola } from "consola";
import { findApiKey, sumCompletionTokenUsage } from "@/db";

const logger = consola.withTag("usageQuery");

export const usageQueryApi = new Elysia({
  detail: {
    security: [{ apiKey: [] }],
  },
})
  .use(apiKeyPlugin)
  .get(
    "/usage",
    async ({ error, bearer }) => {
      if (bearer === undefined) {
        return error(500);
      }

      logger.debug("queryUsage", bearer);
      const key = await findApiKey(bearer);
      if (key === null) {
        return null;
      }
      return sumCompletionTokenUsage(key.id);
    },
    {
      checkApiKey: true,
    },
  );
