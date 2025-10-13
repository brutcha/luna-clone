import { makePersistedAdapter } from "@livestore/adapter-expo";

/**
 * TODO: add cloudflare durable object sync
 * ? sync just when AuthClient has valid token
 */
export const adapter = makePersistedAdapter({});
