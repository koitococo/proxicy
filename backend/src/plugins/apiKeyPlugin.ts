import { Elysia } from "elysia";
import { checkApiKey } from "@/utils/apiKey.ts";
import { ADMIN_SUPER_SECRET } from "@/utils/config.ts";

export const apiKeyPlugin = new Elysia({ name: "apiKeyPlugin" })
  .derive({ as: "global" }, ({ headers }) => {
    if (!headers.authorization) return;
    const [method, key] = headers.authorization.split(" ");
    if (method !== "Bearer") return;

    return {
      bearer: key,
    };
  })
  .macro({
    checkApiKey: {
      async beforeHandle({ error, bearer }) {
        if (!bearer || !(await checkApiKey(bearer))) return error(401, "Invalid API key");
      },
    },
    checkAdminApiKey: {
      async beforeHandle({ error, bearer }) {
        if (!bearer || !(bearer === ADMIN_SUPER_SECRET)) return error(401, "Invalid admin secret");
      },
    },
  });
