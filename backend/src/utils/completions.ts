import { findApiKey, insertCompletion } from "../db";
import type { CompletionsCompletionType, CompletionsPromptType } from "../db/schema";

/**
 * add a new completion to the database
 * @param c the completion to add. tokens usage should be -1 if not provided by the upstream API
 * @param apiKey the key to use
 * @returns the new completion
 */
export async function addCompletions(
	c: {
		model: string;
		prompt: CompletionsPromptType;
		prompt_tokens: number;
		completion: CompletionsCompletionType;
		completion_tokens: number;
	},
	apiKey?: string,
) {
	const keyId =
		apiKey === undefined ? -1 : ((await findApiKey(apiKey))?.id ?? -1);
	return await insertCompletion({
		apiKeyId: keyId,
		...c,
	});
}
