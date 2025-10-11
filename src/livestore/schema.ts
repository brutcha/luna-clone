import {
  makeSchema,
  Schema,
  SessionIdSymbol,
  State,
} from "@livestore/livestore";

export const tables = {
  // TODO: make user a synced document
  user: State.SQLite.clientDocument({
    name: "user",
    schema: Schema.Struct({
      name: Schema.String,
    }),
    default: {
      id: SessionIdSymbol,
      value: { name: "Dev User" },
    },
  }),
};

export const events = {
  userSet: tables.user.set,
};

const materializers = State.SQLite.materializers(events, {});

const state = State.SQLite.makeState({ tables, materializers });

export const schema = makeSchema({ events, state });
