import { Elysia } from "elysia";
import { consola } from "consola";

const logger = consola.withTag("router");

export const loggerPlugin = new Elysia({
  name: "loggerPlugin",
}).onAfterResponse({ as: "global" }, ({ request, set }) => {
  logger.log(`${request.url} ${set.status}`);
});
