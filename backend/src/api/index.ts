import { Elysia } from "elysia";
import { completionApi } from "./completion";

export const routes = new Elysia()
  .use(completionApi);
