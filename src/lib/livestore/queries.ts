import { computed, queryDb } from "@livestore/livestore";

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
 * Returns null if id is null, or user is not found
 */
export const userById$ = (id: string | null) =>
  computed(
    (get) => {
      if (!id) {
        return null;
      }

      return get(
        queryDb(
          tables.users
            .select()
            .where("id", id)
            .first({ fallback: () => null }),
        ),
      );
    },
    {
      label: "user-by-id",
      deps: [id],
    },
  );
