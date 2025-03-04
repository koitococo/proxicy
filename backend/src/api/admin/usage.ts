import { findApiKey, sumCompletionTokenUsage } from "@/db";
import { Elysia, t } from "elysia";

export const adminUsage = new Elysia().get(
  "/usage",
  async ({ query, error }) => {
    if (query.apiKey === undefined) {
      return await sumCompletionTokenUsage();
    }
    const key = await findApiKey(query.apiKey);
    if (key === null) {
      return error(404, "Key not found");
    }
    return await sumCompletionTokenUsage(key.id);
  },
  {
    query: t.Object({
      apiKey: t.Optional(t.String()),
    }),
  },
);
