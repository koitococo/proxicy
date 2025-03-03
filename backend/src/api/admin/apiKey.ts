import { findApiKey, listApiKeys } from "@/db";
import { generateApiKey, newApiKey, revokeApiKey } from "@/utils/apiKey";
import { Elysia, t } from "elysia";

export const adminApiKey = new Elysia()
  .get("/apiKey", async (_) => {
    return JSON.stringify(await listApiKeys());
  })
  .get(
    "/apiKey/:key",
    async ({ error, params }) => {
      const { key } = params;
      const r = await findApiKey(key);
      if (r === null) {
        return error(404, "Key not found");
      }
      return JSON.stringify(r);
    },
    {
      params: t.Object({
        key: t.String(),
      }),
    },
  )
  .post(
    "/apiKey",
    async ({ body, error }) => {
      const key = generateApiKey();
      const r = await newApiKey(key, body.expires_at, body.comment);
      if (r === null) {
        return error(500, "Failed to create key");
      }
      return JSON.stringify({
        key: r.key,
      });
    },
    {
      body: t.Object({
        expires_at: t.Optional(t.Date()),
        comment: t.Optional(t.String()),
      }),
    },
  )
  .delete(
    "/apiKey/:key",
    async ({ error, params }) => {
      const { key } = params;
      const r = await revokeApiKey(key);
      if (r === null) {
        return error(404, "Key not found");
      }
      return JSON.stringify({
        key: r.key,
        revoked: r.revoked,
      });
    },
    {
      params: t.Object({
        key: t.String(),
      }),
    },
  );
