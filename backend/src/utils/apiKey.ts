import { findApiKey, upsertApiKey } from "../db";
import * as crypto from "node:crypto";

/**
 * check if an API key is valid
 * @param key the key to check
 * @returns true if the key is valid
 */
export async function checkApiKey(key: string): Promise<boolean> {
	const r = await findApiKey(key);
	return (
		r !== null &&
		!r.revoked &&
		(r.expires_at === null || r.expires_at > new Date())
	);
}

/**
 * generate a random API key
 * @returns a new API key
 */
function generateApiKey() {
	const buf = crypto.randomBytes(16);

	return `sk-${Array.from(buf, (v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * add a new API key to the database
 * @param key api key, unique from other keys
 * @param expires_at optional, when the key expires
 * @param comment optional, a comment for the key
 * @returns record of the new key
 */
export async function newApiKey(
	key: string,
	expires_at?: Date,
	comment?: string,
) {
	const r = await upsertApiKey({
		key,
		comment,
		expires_at,
	});
	return r;
}

/**
 * revoke an API key
 * @remarks this does not delete the key from database for auditing, but marks it as revoked. NEVER reuse a revoked key.
 * @param key the key to revoke
 * @returns record of the revoked key
 */
export async function revokeApiKey(key: string) {
	const r = await upsertApiKey({
		key,
		revoked: true,
		updated_at: new Date(),
	});
	return r;
}
