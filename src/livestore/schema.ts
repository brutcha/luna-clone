import { Events, makeSchema, Schema, State } from "@livestore/livestore";

export const tables = {
  config: State.SQLite.clientDocument({
    name: "config",
    schema: Schema.Struct({
      sessionID: Schema.String.pipe(Schema.minLength(21), Schema.optional),
      isSyncEnabled: Schema.Boolean,
    }).annotations({
      identifier: "LivestoreConfig",
    }),
    default: {
      id: "@livestore/config.tableID",
      value: {
        isSyncEnabled: false,
      },
    },
  }),
  users: State.SQLite.table({
    name: "users",
    columns: {
      id: State.SQLite.text({
        primaryKey: true,
        schema: Schema.String.pipe(Schema.minLength(21)),
      }),
      name: State.SQLite.text({
        schema: Schema.String.pipe(Schema.minLength(1)),
      }),
      createdAt: State.SQLite.integer({ schema: Schema.DateFromNumber }),
    },
  }),
};

export const events = {
  configSet: tables.config.set,
  userCreated: Events.synced({
    name: "v1.UserCreated",
    schema: Schema.Struct({
      id: Schema.String.pipe(Schema.minLength(21)),
      name: Schema.String.pipe(Schema.minLength(1)),
      createdAt: Schema.DateFromNumber,
    }),
  }),
};

const materializers = State.SQLite.materializers(events, {
  "v1.UserCreated": ({ id, name, createdAt }) => {
    return tables.users.insert({
      id,
      name,
      createdAt,
    });
  },
});

const state = State.SQLite.makeState({ tables, materializers });

export const schema = makeSchema({ events, state });
