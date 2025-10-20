import { makeSchema, Schema, State } from "@livestore/livestore";

/**
 * System database schema - stores global app configuration.
 * This database exists independently of user databases.
 */
export const systemTables = {
  config: State.SQLite.clientDocument({
    name: "config",
    schema: Schema.Struct({
      sessionID: Schema.String.pipe(Schema.minLength(21), Schema.optional),
      isSyncEnabled: Schema.Boolean,
    }).annotations({
      identifier: "SystemConfig",
    }),
    default: {
      id: "@system/config.tableID",
      value: {
        // sessionID is optional - will be set by User/Auth service on first boot
        isSyncEnabled: false,
      },
    },
  }),
};

export const systemEvents = {
  configSet: systemTables.config.set,
};

const systemState = State.SQLite.makeState({
  tables: systemTables,
  materializers: {},
});

export const systemSchema = makeSchema({
  events: systemEvents,
  state: systemState,
});
