import { Elysia } from "elysia";
import { consola } from "consola";

export const loggerPlugin = new Elysia({ name: "loggerPlugin" })
  .onAfterResponse({ as: "global" }, ({ request, set }) => {
    consola.log(`${request.url} ${set.status}`)
  })