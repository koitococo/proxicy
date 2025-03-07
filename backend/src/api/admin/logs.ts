import { getLog, listLogs } from "@/db";
import { Elysia, t } from "elysia";

export const adminLogs = new Elysia()
  .get(
    "/logs",
    async ({ query }) => {
      return await listLogs(
        query.offset ?? 0,
        query.limit ?? 100,
        query.apiKeyId,
        query.upstreamId,
        query.completionId,
      );
    },
    {
      query: t.Object({
        offset: t.Optional(t.Integer()),
        limit: t.Optional(t.Integer()),
        apiKeyId: t.Optional(t.Integer()),
        upstreamId: t.Optional(t.Integer()),
        completionId: t.Optional(t.Integer()),
      }),
    },
  )
  .get(
    "/logs/:id",
    async ({ error, params }) => {
      const { id } = params;
      const r = await getLog(id);
      if (r === null) {
        return error(404, "Log not found");
      }
      return r;
    },
    {
      params: t.Object({
        id: t.Integer(),
      }),
    },
  );
