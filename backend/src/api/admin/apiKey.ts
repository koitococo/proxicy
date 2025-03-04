import { findApiKey, listApiKeys, upsertApiKey } from "@/db";
import { generateApiKey } from "@/utils/apiKey";
import { Elysia, t } from "elysia";

export const adminApiKey = new Elysia()
  .get("/apiKey", async (_) => {
    return await listApiKeys();
  })
  .get(
    "/apiKey/:key",
    async ({ error, params }) => {
      const { key } = params;
      const r = await findApiKey(key);
      if (r === null) {
        return error(404, "Key not found");
      }
      return r;
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
      const r = await upsertApiKey({
        key,
        comment: body.comment,
        expires_at: body.expires_at,
      });
      if (r === null) {
        return error(500, "Failed to create key");
      }
      return {
        key: r.key,
      };
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
      const r = await upsertApiKey({
        key,
        revoked: true,
        updated_at: new Date(),
      });
      if (r === null) {
        return error(404, "Key not found");
      }
      return {
        key: r.key,
        revoked: r.revoked,
      };
    },
    {
      params: t.Object({
        key: t.String(),
      }),
    },
  );
