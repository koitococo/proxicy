import { Elysia } from "elysia";
import { checkApiKey } from "../utils/apiKey";

export const apiKeyPlugin = new Elysia({ name: "apiKeyPlugin" })
	.derive({ as: "global" }, ({ headers }) => {
		if (!headers.authorization) return;
		const [method, key] = headers.authorization.split(" ");
		if (method !== "Bearer") return;

		return {
			userKey: key,
		};
	})
	.macro({
		checkApiKey: {
			async beforeHandle({ headers, error, userKey }) {
				if (!userKey || !(await checkApiKey(userKey))) return error(401, "Invalid API key");
			},
		},
	});
