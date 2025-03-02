import { Elysia, t } from "elysia";
import type { ChatCompletionChunk, ChatCompletion } from "openai/resources";

import { apiKeyPlugin } from "../plugins/apiKeyPlugin";
import { addCompletions } from "../utils/completions";
import { parseSse } from "../utils/sse";
import { consola } from "consola";

const logger = consola.withTag("completionsApi");

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

export const completionsApi = new Elysia().use(apiKeyPlugin).post(
  "/chat/completions",
  async function* ({ body, error, userKey }) {
    const upstreamEndpoint = `${process.env.UPSTREAM_API}/chat/completions`;
    const upstreamAuth = `Bearer ${process.env.UPSTREAM_API_KEY}`;

    const cleanedMessages = body.messages.map((u) => {
      const m = u as { role: string; content: string };
      return {
        role: m.role as string,
        content: m.content as string,
      };
    });
    switch (!!body.stream) {
      case false: {
        logger.log("proxying completions request to upstream", {
          userKey,
          upstreamEndpoint,
        });
        const resp = await fetch(upstreamEndpoint, {
          method: "POST",
          headers: {
            Authorization: upstreamAuth,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!resp.ok) {
          const msg = await resp.text();
          logger.error("upstream error", {
            status: resp.status,
            msg,
          });
          return error(resp.status, msg);
        }
        const respText = await resp.text();
        const respJson = JSON.parse(respText) as ChatCompletion;

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
        if (!!body.n && body.n > 1) {
          return error(400, "Stream completions with n > 1 is not supported");
        }

        // always set include_usage to true
        body.stream_options = {
          include_usage: true,
        };
        logger.log("proxying stream completions request to upstream", {
          userKey,
          upstreamEndpoint,
          stream: true,
        });
        const resp = await fetch(upstreamEndpoint, {
          method: "POST",
          headers: {
            Authorization: upstreamAuth,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!resp.ok) {
          const msg = await resp.text();
          logger.error("upstream error", {
            status: resp.status,
            msg,
          });
          return error(resp.status, msg);
        }
        if (!resp.body) {
          logger.error("upstream error", {
            status: resp.status,
            msg: "No body",
          });
          return error(500, "No body");
        }

        const chunks: AsyncGenerator<string> = parseSse(resp.body);

        const partials = [];
        for await (const chunk of chunks) {
          const data = JSON.parse(chunk) as ChatCompletionChunk;
          if (data.choices.length === 1) {
            const content = data.choices[0].delta.content ?? "";
            partials.push(content);
          } else if (data.choices.length === 0) {
            // Assuse that is the last chunk
            const usage = data.usage ?? undefined;
            const full = partials.join("");
            const c = {
              model: data.model,
              prompt: {
                messages: cleanedMessages,
                n: body.n,
              },
              prompt_tokens: usage?.prompt_tokens ?? -1,
              completion: [{ role: undefined, content: full }], // Stream API does not provide role
              completion_tokens: usage?.completion_tokens ?? -1,
            };
            addCompletions(c, userKey);
            break;
          } else {
            return error(500, "Unexpected chunk");
          }
          yield `data: ${chunk}\n\n`;
        }
        for await (const chunk of chunks) {
          // Continue to yield the rest of the chunks if needed
          yield `data: ${chunk}\n\n`;
        }
      }
    }
  },
  {
    body: tChatCompletionCreate,
    checkApiKey: true,
  },
);
