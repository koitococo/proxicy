import { Elysia, t } from "elysia";
import type { ChatCompletionChunk, ChatCompletion } from "openai/resources";

import { apiKeyPlugin } from "../plugins/apiKeyPlugin";
import { addCompletions } from "../utils/completions";
import { parseSse } from "../utils/sse";
import { consola } from "consola";
import { selectUpstream, upstreams } from "@/utils/upstream";

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
  async function* ({ body, error, bearer }) {
    const upstream = selectUpstream(upstreams, body.model);
    if (!upstream) {
      return error(404, "Model not found");
    }
    const upstreamName = upstream.name;
    const upstreamEndpoint = `${upstream.endPoint}/chat/completions`;
    const upstreamAuth = upstream.apiKey
      ? `Bearer ${upstream.apiKey}`
      : undefined;

    const cleanedMessages = body.messages.map((u) => {
      const m = u as { role: string; content: string };
      return {
        role: m.role as string,
        content: m.content as string,
      };
    });

    const reqInit: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(upstreamAuth ? { Authorization: upstreamAuth } : {}),
      },
    };

    switch (!!body.stream) {
      case false: {
        logger.verbose("proxying completions request to upstream", {
          bearer,
          upstreamEndpoint,
        });
        const begin = Date.now();
        const resp = await fetch(upstreamEndpoint, {
          body: JSON.stringify(body),
          ...reqInit,
        });

        if (!resp.ok) {
          const msg = await resp.text();
          logger.error("upstream error", {
            status: resp.status,
            msg,
          });
          addCompletions({
            model: body.model,
            upstream: upstreamName,
            prompt: {
              messages: cleanedMessages,
              n: body.n,
            },
            prompt_tokens: -1,
            completion: [],
            completion_tokens: -1,
            status: "failed",
            ttft: -1,
            duration: -1,
          });
          return error(resp.status, msg);
        }
        const respText = await resp.text();
        const respJson = JSON.parse(respText) as ChatCompletion;

        addCompletions(
          {
            model: body.model,
            upstream: upstreamName,
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
            status: "completed",
            ttft: Date.now() - begin,
            duration: Date.now() - begin,
          },
          bearer,
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

        logger.verbose("proxying stream completions request to upstream", {
          userKey: bearer,
          upstreamEndpoint,
          stream: true,
        });
        const begin = Date.now();
        const resp = await fetch(upstreamEndpoint, {
          body: JSON.stringify(body),
          ...reqInit,
        });

        if (!resp.ok) {
          const msg = await resp.text();
          logger.error("upstream error", {
            status: resp.status,
            msg,
          });
          addCompletions({
            model: body.model,
            upstream: upstreamName,
            prompt: {
              messages: cleanedMessages,
              n: body.n,
            },
            prompt_tokens: -1,
            completion: [],
            completion_tokens: -1,
            status: "failed",
            ttft: -1,
            duration: -1,
          });
          return error(resp.status, msg);
        }
        if (!resp.body) {
          logger.error("upstream error", {
            status: resp.status,
            msg: "No body",
          });
          addCompletions({
            model: body.model,
            upstream: upstreamName,
            prompt: {
              messages: cleanedMessages,
              n: body.n,
            },
            prompt_tokens: -1,
            completion: [],
            completion_tokens: -1,
            status: "failed",
            ttft: -1,
            duration: -1,
          });
          return error(500, "No body");
        }

        const chunks: AsyncGenerator<string> = parseSse(resp.body);

        let ttft = -1;
        let isFirstChunk = true;
        const partials = [];
        for await (const chunk of chunks) {
          if (isFirstChunk) {
            // log the time to first chunk as ttft
            isFirstChunk = false;
            ttft = Date.now() - begin;
          }
          if (chunk.startsWith("[DONE]")) {
            // Workaround: In most cases, upstream will return a message that is a valid json, and has length of choices = 0,
            //   which will be handled in below. However, in some cases, the last message is '[DONE]', and no usage is returned.
            //   In this case, we will end this completion.
            addCompletions(
              {
                model: body.model,
                upstream: upstreamName,
                prompt: {
                  messages: cleanedMessages,
                  n: body.n,
                },
                prompt_tokens: -1,
                completion: [{ role: undefined, content: partials.join("") }], // Stream API does not provide role
                completion_tokens: -1,
                status: "completed",
                ttft,
                duration: Date.now() - begin,
              },
              bearer,
            );
            yield `data: ${chunk}\n\n`;
            break;
          }

          let data: ChatCompletionChunk | undefined = undefined;
          try {
            data = JSON.parse(chunk) as ChatCompletionChunk;
          } catch (e) {
            logger.error("Error occured when parsing json", e);
          }
          if (data === undefined) {
            // Unreachable, unless json parsing failed indicating a malformed response
            logger.error("upstream error", {
              status: resp.status,
              msg: "Invalid JSON",
              chunk,
            });
            return error(500, "Invalid JSON");
          }

          if (data.choices.length === 1) {
            // If there is only one choice, regular chunk
            const content = data.choices[0].delta.content ?? "";
            partials.push(content);
            yield `data: ${chunk}\n\n`;
            continue;
          }
          if (data.choices.length === 0) {
            // Assuse that is the last chunk
            addCompletions(
              {
                model: data.model,
                upstream: upstreamName,
                prompt: {
                  messages: cleanedMessages,
                  n: body.n,
                },
                prompt_tokens: (data.usage ?? undefined)?.prompt_tokens ?? -1,
                completion: [{ role: undefined, content: partials.join("") }], // Stream API does not provide role
                completion_tokens:
                  (data.usage ?? undefined)?.completion_tokens ?? -1,
                status: "completed",
                ttft,
                duration: Date.now() - begin,
              },
              bearer,
            );
            yield `data: ${chunk}\n\n`;
            break;
          }
          // Unreachable, unless upstream returned a malformed response
          return error(500, "Unexpected chunk");
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
