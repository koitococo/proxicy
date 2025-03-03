import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";
import { and, eq, sum } from "drizzle-orm";
import consola from "consola";

const globalThis_ = globalThis as typeof globalThis & {
  db: ReturnType<typeof drizzle>;
};

const logger = consola.withTag("database");

const db = (() => {
  if (!globalThis_.db) {
    globalThis_.db = drizzle({
      connection: process.env.DATABASE_URL || "postgres://localhost:5432",
      schema: schema,
    });
    logger.success("connection created");
  }
  return globalThis_.db;
})();

export type ApiKey = typeof schema.ApiKeysTable.$inferSelect;
export type ApiKeyInsert = typeof schema.ApiKeysTable.$inferInsert;
export type Completion = typeof schema.CompletionsTable.$inferSelect;
export type CompletionInsert = typeof schema.CompletionsTable.$inferInsert;

/**
 * find api key in database
 * @param key api key
 * @returns db record of api key, null if not found
 */
export async function findApiKey(key: string): Promise<ApiKey | null> {
  logger.verbose("findApiKey", key);
  const r = await db.select().from(schema.ApiKeysTable).where(eq(schema.ApiKeysTable.key, key));
  return r.length === 1 ? r[0] : null;
}

/**
 * insert api key into database, or update if already exists
 * @param c parameters of api key to insert or update
 * @returns db record of api key
 */
export async function upsertApiKey(c: ApiKeyInsert): Promise<ApiKey | null> {
  logger.verbose("upsertApiKey", c);
  const r = await db
    .insert(schema.ApiKeysTable)
    .values(c)
    .onConflictDoUpdate({
      target: schema.ApiKeysTable.key,
      set: c,
    })
    .returning();
  return r.length === 1 ? r[0] : null;
}

/**
 * insert completion into database
 * @param c parameters of completion to insert
 * @returns db record of completion, null if already exists
 */
export async function insertCompletion(c: CompletionInsert): Promise<Completion | null> {
  logger.verbose("insertCompletion", c.model);
  const r = await db.insert(schema.CompletionsTable).values(c).onConflictDoNothing().returning();
  return r.length === 1 ? r[0] : null;
}

/**
 * count total prompt tokens and completion tokens used by the api key
 * @param apiKeyId key id, referencing to id colume in api keys table
 * @returns total prompt tokens and completion tokens used by the api key
 */
export async function sumCompletionTokenUsage(apiKeyId?: number, model?: string) {
  logger.verbose("sumCompletionTokenUsage", apiKeyId);
  const r = await db
    .select({
      total_prompt_tokens: sum(schema.CompletionsTable.prompt_tokens),
      total_completion_tokens: sum(schema.CompletionsTable.completion_tokens),
    })
    .from(schema.CompletionsTable)
    .where(
      and(
        apiKeyId !== undefined ? eq(schema.CompletionsTable.apiKeyId, apiKeyId) : undefined,
        model !== undefined ? eq(schema.CompletionsTable.model, model) : undefined,
      ),
    );
  return r.length === 1 ? r[0] : null;
}
