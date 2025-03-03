import { findApiKey } from "@/db";
import { generateApiKey, newApiKey, revokeApiKey } from "@/utils/apiKey";
import consola from "consola";
import { Elysia, t } from "elysia";

const logger = consola.withTag("adminApiKey");

const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET ?? "admin";
if (SUPER_ADMIN_SECRET.length < 6) {
  logger.warn(
    "SUPER_ADMIN_SECRET is too short, please set it to a longer value",
  );
}

const tApiKeyCreate = t.Object({
  expires_at: t.Optional(t.Date()),
  comment: t.Optional(t.String()),
});

export const adminApiKey = new Elysia()
  .get(
    "/apiKey/:key",
    async function* ({ error, params }) {
      const { key } = params;
      const r = await findApiKey(key);
      if (r === null) {
        return error(404, "Key not found");
      }
      yield JSON.stringify(r);
    },
    {
      params: t.Object({
        key: t.String(),
      }),
    },
  )
  .post(
    "/apiKey",
    async function* ({ body, error }) {
      const key = generateApiKey();
      const r = await newApiKey(key, body.expires_at, body.comment);
      if (r === null) {
        return error(500, "Failed to create key");
      }
      yield JSON.stringify({
        key: r.key,
      });
    },
    {
      body: tApiKeyCreate,
    },
  )
  .delete(
    "/apiKey/:key",
    async function* ({ error, params }) {
      const { key } = params;
      const r = await revokeApiKey(key);
      if (r === null) {
        return error(404, "Key not found");
      }
      yield JSON.stringify({
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
