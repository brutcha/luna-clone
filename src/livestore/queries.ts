import { queryDb } from "@livestore/livestore";

import { tables } from "./schema";

export const config$ = queryDb(tables.config.get(), {
  label: "livestore-config",
});

export const user$ = (id: string) =>
  queryDb(tables.users.select("name").where("id", id).first(), {
    label: "livestore-user",
  });
