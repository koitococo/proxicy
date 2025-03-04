import { deleteUpstream, insertUpstream, listUpstreams } from "@/db";
import Elysia, { t } from "elysia";

export const adminUpstream = new Elysia()
  .get("/upstream", async (_) => {
    return await listUpstreams();
  })
  .post(
    "/upstream",
    async ({ body, error }) => {
      const r = await insertUpstream(body);
      if (r === null) {
        return error(500, "Failed to create upstream");
      }
      return r;
    },
    {
      body: t.Object({
        model: t.String(),
        name: t.String(),
        url: t.String(),
        apiKey: t.Optional(t.String()),
      }),
    },
  )
  .delete(
    "/upstream/:id",
    async ({ error, params }) => {
      const { id } = params;
      const r = await deleteUpstream(id);
      if (r === null) {
        return error(404, "Upstream not found");
      }
      return r;
    },
    {
      params: t.Object({
        id: t.Integer(),
      }),
    },
  );
