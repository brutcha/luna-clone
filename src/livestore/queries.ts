import { computed, queryDb } from "@livestore/livestore";

import { tables } from "./schema";

export const config$ = queryDb(tables.config.get(), {
  label: "livestore-config",
});

const userById$ = (id: string) =>
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

export const currentUser$ = computed(
  (get) => {
    const { sessionID } = get(config$);

    if (!sessionID) {
      return undefined;
    }

    return get(userById$(sessionID));
  },
  {
    label: "current-user",
  },
);
