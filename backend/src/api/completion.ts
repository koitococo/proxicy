import { Elysia, t } from "elysia";
import type {
	ChatCompletionCreateParams,
	ChatCompletionChunk,
	ChatCompletion,
} from "openai/resources";

import { apiKeyPlugin } from "../plugins/apiKeyPlugin";
import { addCompletions } from "../utils/completions";

// very basic validation for only top level fields
export const tChatCompletionCreate = t.Object({
	messages: t.Array(t.Unknown()),
	model: t.String(),
	frequency_penalty: t.Optional(t.Number()),
	logprobs: t.Optional(t.Boolean()),
	max_tokens: t.Optional(t.Number()),
	n: t.Optional(t.Number()),
	presence_penalty: t.Optional(t.Number()),
	response_format: t.Optional(t.Unknown()),
	stop: t.Optional(t.Union([t.String(), t.Array(t.String())])),
	stream: t.Optional(t.Boolean()),
	stream_options: t.Optional(t.Unknown()),
	temperature: t.Optional(t.Number()),
	tool_choice: t.Optional(t.Unknown()),
	tools: t.Optional(t.Array(t.Unknown())),
	top_logprobs: t.Optional(t.Number()),
	top_p: t.Optional(t.Number()),
});

export const completionApi = new Elysia().use(apiKeyPlugin).post(
	"/completion",
	async function* ({ body, error, userKey }) {
		const upstreamEndpoint = process.env.UPSTREAM_API || "";
		const upstreamAuth = `Bearer ${process.env.UPSTREAM_API_KEY}`;

		switch (body.stream) {
			case false: {
				const resp = await fetch(upstreamEndpoint, {
					method: "POST",
					headers: {
						Authorization: upstreamAuth,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body),
				});

				if (!resp.ok) return error(resp.status, await resp.text());
				const respText = await resp.text();
				const respJson = JSON.parse(respText) as ChatCompletion;

				const cleanedMessages = body.messages.map((u) => {
					const m = u as { role: string; content: string };
					return {
						role: m.role as string,
						content: m.content as string,
					};
				});

				addCompletions(
					{
						model: body.model,
						prompt: {
							messages: cleanedMessages,
							n: body.n,
						},
						prompt_tokens: respJson.usage?.prompt_tokens ?? -1,
						completion: respJson.choices.map((c) => ({
							role: c.message.role as string,
							content: c.message.content ?? undefined,
						})),
						completion_tokens: respJson.usage?.completion_tokens ?? -1,
					},
					userKey,
				);

				return respText;
			}

			case true: {
				// always set include_usage to true
				if (!!body.n && body.n > 1) {
					return error(400, "Stream completions with n > 1 is not supported");
				}
				body.stream_options = {
					include_usage: true,
				};

				const resp = await fetch(upstreamEndpoint, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body),
				});

				if (!resp.ok) return error(resp.status, await resp.text());
				if (!resp.body) return error(500, "No body");

				const reader = resp.body.getReader();
				while (true) {
					const { value, done } = await reader.read();
					if (done) break;

					const chunk: ChatCompletionChunk = JSON.parse(
						new TextDecoder().decode(value),
					);
					// TODO: do something with chunk here
					// TODO: if usage is not null, store usage

					yield value;
				}
			}
		}
		// TODO:
	},
	{
		body: tChatCompletionCreate,
		checkApiKey: true,
	},
);
