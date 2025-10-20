import { Events, makeSchema, Schema, State } from "@livestore/livestore";

/**
 * User database schema - stores per-user data.
 * Each user gets their own isolated database instance.
 */
export const tables = {
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
