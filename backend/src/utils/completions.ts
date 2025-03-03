import { findApiKey, insertCompletion, sumCompletionTokenUsage } from "@/db";
import type { CompletionsCompletionType, CompletionsPromptType, CompletionsStatusEnumType } from "@/db/schema";

/**
 * add a new completion to the database
 * @param c the completion to add. tokens usage should be -1 if not provided by the upstream API
 * @param apiKey the key to use
 * @returns the new completion
 */
export async function addCompletions(
  c: {
    model: string;
    upstream: string;
    prompt: CompletionsPromptType;
    prompt_tokens: number;
    completion: CompletionsCompletionType;
    completion_tokens: number;
    status: CompletionsStatusEnumType;
    ttft: number;
    duration: number;
  },
  apiKey?: string,
) {
  const keyId = apiKey === undefined ? -1 : ((await findApiKey(apiKey))?.id ?? -1);
  return await insertCompletion({
    apiKeyId: keyId,
    ...c,
  });
}

export async function queryUsage(apiKey: string) {
  const key = await findApiKey(apiKey);
  if (key === null) {
    return null;
  }
  return sumCompletionTokenUsage(key.id, undefined);
}
