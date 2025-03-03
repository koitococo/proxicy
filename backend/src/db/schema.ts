import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const ApiKeysTable = pgTable("api_keys", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: varchar("key", {
    length: 63,
  })
    .notNull()
    .unique(),
  comment: varchar("comment"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  expires_at: timestamp("expires_at"),
  revoked: boolean("revoked").notNull().default(false),
});

export type CompletionsPromptType = {
  messages: {
    role: string;
    content: string;
  }[];
  n?: number;
};

export type CompletionsCompletionType = {
  role?: string; // null in stream api
  content?: string;
}[];

export const CompletionsTable = pgTable("completions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity().unique(),
  // prev_id: integer("prev_id").references(
  // 	(): AnyPgColumn => CompletionsTable.id,
  // ),
  apiKeyId: integer("apiKeyId")
    .notNull()
    .references((): AnyPgColumn => ApiKeysTable.id),
  model: varchar("model").notNull(),
  upstream: varchar("upstream").notNull(),
  prompt: jsonb("prompt").notNull().$type<CompletionsPromptType>(),
  prompt_tokens: integer("prompt_tokens").notNull(),
  completion: jsonb("completion").notNull().$type<CompletionsCompletionType>(),
  completion_tokens: integer("completion_tokens").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  deleted: boolean("deleted").notNull().default(false),
});

export const CompletionsTableRelations = relations(
  CompletionsTable,
  ({ one }) => {
    return {
      // prev_id: one(CompletionsTable, {
      // 	fields: [CompletionsTable.prev_id],
      // 	references: [CompletionsTable.id],
      // }),
      apiKeyId: one(ApiKeysTable, {
        fields: [CompletionsTable.apiKeyId],
        references: [ApiKeysTable.id],
      }),
    };
  },
);
