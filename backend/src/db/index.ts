import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";
import { like, eq } from "drizzle-orm";

const globalThis_ = globalThis as typeof globalThis & {
	db: ReturnType<typeof drizzle>;
};

const db = (() => {
	if (!globalThis_.db) {
		globalThis_.db = drizzle({
			connection: process.env.DATABASE_URL || "postgres://localhost:5432",
      schema: schema,
		});
	}
	return globalThis_.db;
})();

export type ApiKey = typeof schema.ApiKeysTable.$inferSelect;
export type ApiKeyInsert = typeof schema.ApiKeysTable.$inferInsert;
export type Completion = typeof schema.CompletionsTable.$inferSelect;
export type CompletionInsert = typeof schema.CompletionsTable.$inferInsert;

export async function findApiKey(key: string): Promise<ApiKey | null> {
	const r = await db
		.select()
		.from(schema.ApiKeysTable)
		.where(eq(schema.ApiKeysTable.key, key));
	return r.length === 1 ? r[0] : null;
}

export async function upsertApiKey(c: ApiKeyInsert): Promise<ApiKey | null> {
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

export async function insertCompletion(
	c: CompletionInsert,
): Promise<Completion | null> {
	const r = await db
		.insert(schema.CompletionsTable)
		.values(c)
		.onConflictDoNothing()
		.returning();
	return r.length === 1 ? r[0] : null;
}
