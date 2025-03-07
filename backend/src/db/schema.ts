import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  revoked: boolean("revoked").notNull().default(false),
});

export const UpstreamTable = pgTable("upstreams", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", {
    length: 63,
  }).notNull(),
  url: varchar("url", {
    length: 255,
  }).notNull(),
  model: varchar("model", {
    length: 63,
  }).notNull(),
  apiKey: varchar("api_key", {
    length: 255,
  }),
  comment: varchar("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deleted: boolean("deleted").notNull().default(false),
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

export const CompletionsStatusEnum = pgEnum("completions_status", [
  "pending",
  "completed",
  "failed",
]);
export type CompletionsStatusEnumType = "pending" | "completed" | "failed";

export const CompletionsTable = pgTable("completions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity().unique(),
  apiKeyId: integer("api_key_id")
    .notNull()
    .references((): AnyPgColumn => ApiKeysTable.id),
  upstreamId: integer("upstream_id").references((): AnyPgColumn => UpstreamTable.id),
  model: varchar("model").notNull(),
  prompt: jsonb("prompt").notNull().$type<CompletionsPromptType>(),
  promptTokens: integer("prompt_tokens").notNull(),
  completion: jsonb("completion").notNull().$type<CompletionsCompletionType>(),
  completionTokens: integer("completion_tokens").notNull(),
  status: CompletionsStatusEnum().notNull().default("pending"),
  ttft: integer("ttft").notNull(),
  duration: integer("duration").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deleted: boolean("deleted").notNull().default(false),
  rating: real("rating"),
});

export const SrvLogsLevelEnum = pgEnum("srv_logs_level", ["unspecific", "info", "warn", "error"]);
export type SrvLogsLevelEnumType = (typeof SrvLogsLevelEnum.enumValues)[number];

export const SrvLogsTable = pgTable("srv_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity().unique(),
  relatedApiKeyId: integer("related_api_key_id").references((): AnyPgColumn => ApiKeysTable.id),
  relatedUpstreamId: integer("related_upstream_id").references((): AnyPgColumn => UpstreamTable.id),
  relatedCompletionId: integer("related_completion_id").references(
    (): AnyPgColumn => CompletionsTable.id,
  ),
  message: varchar("message").notNull(),
  level: SrvLogsLevelEnum("level").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  acknowledged: boolean("acknowledged").notNull().default(false),
  ackAt: timestamp("ack_at"),
});
