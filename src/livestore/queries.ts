import { queryDb } from "@livestore/livestore";

import { tables } from "./schema";

export const user$ = queryDb(tables.user.get(), { label: "user" });
