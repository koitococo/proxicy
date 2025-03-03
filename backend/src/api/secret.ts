import { Elysia, t } from "elysia";
import { ADMIN_SUPER_SECRET } from "@/utils/config.ts";

export const checkSecretApi = new Elysia().get(
  "/secret/check",
  ({ query: { secret } }) => {
    return secret === ADMIN_SUPER_SECRET;
  },
  {
    query: t.Object({
      secret: t.String(),
    }),
    response: t.Boolean(),
  },
);
