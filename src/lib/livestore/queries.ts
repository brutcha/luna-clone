import { queryDb } from "@livestore/livestore";

import { tables } from "./schema";
import { systemTables } from "./system-schema";

/**
 * System config query (sessionID, isSyncEnabled)
 * This queries the system database, not the user database
 */
export const systemConfig$ = queryDb(systemTables.config.get(), {
  label: "system-config",
});

/**
 * Get user by ID from the user database
 */
export const userById$ = (id: string) =>
  queryDb(
    tables.users
      .select()
      .where("id", id)
      .first({ fallback: () => undefined }),
    {
      label: "user",
      deps: [id],
    },
  );
