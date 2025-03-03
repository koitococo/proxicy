import { Elysia, t } from "elysia";

import { apiKeyPlugin } from "../plugins/apiKeyPlugin";
import { consola } from "consola";
import { queryUsage } from "../utils/completions";

const logger = consola.withTag("usageQuery");

export const usageQueryApi = new Elysia().use(apiKeyPlugin).get(
  "/usage",
  async ({ error, userKey }) => {
    if (userKey === undefined) {
      return error(400, "missing user key");
    }
    logger.log("queryUsage", userKey);
    return JSON.stringify(queryUsage(userKey));
  },
  {
    checkApiKey: true,
  },
);
