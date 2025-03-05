import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";
import { and, asc, count, eq, not, sum } from "drizzle-orm";
import consola from "consola";
import { DATABASE_URL } from "@/utils/config";

const globalThis_ = globalThis as typeof globalThis & {
  db: ReturnType<typeof drizzle>;
};

const logger = consola.withTag("database");

const db = (() => {
  if (!globalThis_.db) {
    globalThis_.db = drizzle({
      connection: DATABASE_URL,
      schema: schema,
    });
    logger.success("connection created");
  }
  return globalThis_.db;
})();

export type ApiKey = typeof schema.ApiKeysTable.$inferSelect;
export type ApiKeyInsert = typeof schema.ApiKeysTable.$inferInsert;
export type Upstream = typeof schema.UpstreamTable.$inferSelect;
export type UpstreamInsert = typeof schema.UpstreamTable.$inferInsert;
export type Completion = typeof schema.CompletionsTable.$inferSelect;
export type CompletionInsert = typeof schema.CompletionsTable.$inferInsert;

export type PartialList<T> = {
  data: T[];
  total: number;
  from: number;
};

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
 * list ALL api keys in database
 * @returns db records of api keys
 */
export async function listApiKeys(all = false): Promise<ApiKey[]> {
  logger.verbose("listApiKeys");
  return await db
    .select()
    .from(schema.ApiKeysTable)
    .where(all ? undefined : not(schema.ApiKeysTable.revoked))
    .orderBy(asc(schema.ApiKeysTable.id));
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
 * find upstream in database
 * @param model model name
 * @param upstream upstream name
 * @returns db records of upstream, null if not found
 */
export async function findUpstreams(model: string, upstream?: string): Promise<Upstream[]> {
  logger.verbose("findUpstreams", model, upstream);
  const r = await db
    .select()
    .from(schema.UpstreamTable)
    .where(
      and(
        eq(schema.UpstreamTable.model, model),
        upstream !== undefined ? eq(schema.UpstreamTable.name, upstream) : undefined,
        not(schema.UpstreamTable.deleted),
      ),
    );
  return r;
}

/**
 * list ALL upstreams in database, not including deleted ones
 * @returns db records of upstreams
 */
export async function listUpstreams() {
  logger.verbose("listUpstreams");
  const r = await db.select().from(schema.UpstreamTable).where(not(schema.UpstreamTable.deleted));
  return r;
}

/**
 * insert upstream into database
 * @param c parameters of upstream to insert
 * @returns record of the new upstream, null if already exists
 */
export async function insertUpstream(c: UpstreamInsert): Promise<Upstream | null> {
  logger.verbose("insertUpstream", c);
  const r = await db.insert(schema.UpstreamTable).values(c).onConflictDoNothing().returning();
  return r.length === 1 ? r[0] : null;
}

/**
 * mark an upstream as deleted
 * @param id upstream id
 * @returns delete record of upstream, null if not found
 */
export async function deleteUpstream(id: number) {
  logger.verbose("deleteUpstream", id);
  const r = await db
    .update(schema.UpstreamTable)
    .set({ deleted: true })
    .where(eq(schema.UpstreamTable.id, id))
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
export async function sumCompletionTokenUsage(apiKeyId?: number) {
  logger.verbose("sumCompletionTokenUsage", apiKeyId);
  const r = await db
    .select({
      total_prompt_tokens: sum(schema.CompletionsTable.prompt_tokens),
      total_completion_tokens: sum(schema.CompletionsTable.completion_tokens),
    })
    .from(schema.CompletionsTable)
    .where(apiKeyId !== undefined ? eq(schema.CompletionsTable.apiKeyId, apiKeyId) : undefined);
  return r.length === 1 ? r[0] : null;
}

/**
 * list completions in database
 * @param offset offset from first record
 * @param limit number of records to return
 * @param apiKeyId optional, filter by api key id
 * @param upstreamId optional, filter by upstream id
 * @returns list of completions
 */
export async function listCompletions(
  offset: number,
  limit: number,
  apiKeyId?: number,
  upstreamId?: number,
): Promise<PartialList<Completion>> {
  const sq = db
    .select({
      id: schema.CompletionsTable.id,
    })
    .from(schema.CompletionsTable)
    .where(
      and(
        not(schema.CompletionsTable.deleted),
        apiKeyId !== undefined ? eq(schema.CompletionsTable.apiKeyId, apiKeyId) : undefined,
        upstreamId !== undefined ? eq(schema.CompletionsTable.upstreamId, upstreamId) : undefined,
      ),
    )
    .offset(offset)
    .limit(limit)
    .as("sq");
  const r = await db
    .select()
    .from(schema.CompletionsTable)
    .innerJoin(sq, eq(schema.CompletionsTable.id, sq.id))
    .orderBy(asc(schema.CompletionsTable.id));
  const total = await db
    .select({
      total: count(schema.CompletionsTable.id),
    })
    .from(schema.CompletionsTable);
  if (total.length !== 1) {
    throw new Error("total count failed");
  }
  return {
    data: r.map((x) => x.completions),
    total: total[0].total,
    from: offset,
  };
}
/**
 * delete completion from database
 * @param id completion id
 * @returns deleted record of completion, null if not found
 */
export async function deleteCompletion(id: number) {
  logger.verbose("deleteCompletion", id);
  const r = await db
    .update(schema.CompletionsTable)
    .set({ deleted: true })
    .where(eq(schema.CompletionsTable.id, id))
    .returning();
  return r.length === 1 ? r[0] : null;
}
