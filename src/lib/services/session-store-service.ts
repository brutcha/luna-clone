import { Effect, Either, Layer, Schema } from "effect";
import { createStorePromise, Store } from "@livestore/livestore";

import { adapter } from "@/lib/livestore/adapter";
import { systemSchema, systemTables } from "@/lib/livestore/system-schema";
import { InvalidSessionConfigError } from "./domain/errors";

/**
 * SessionStore service - manages session and app configuration persistence.
 *
 * This is a pure storage layer for system-wide data (sessionID, sync settings).
 * Business logic for session creation/management belongs in User or Auth services.
 */

// Recreate the schema based on the table definition for input validation
const SetConfigInputSchema = Schema.partial(systemTables.config.valueSchema);

export class SessionStoreService extends Effect.Service<SessionStoreService>()(
  "@/lib/services/session-store",
  {
    scoped: Effect.gen(function* () {
      yield* Effect.logDebug("Initializing SessionStore");

      const store = yield* Effect.acquireRelease(
        Effect.promise<Store<typeof systemSchema>>(() =>
          createStorePromise({
            schema: systemSchema,
            adapter,
            storeId: "luna-system",
          }),
        ),
        (store) => Effect.promise(() => store.shutdown()),
      );

      return {
        /**
         * Get the current config (sessionID + isSyncEnabled)
         */
        getConfig: () =>
          Effect.sync(() => store.query(systemTables.config.get())),

        /**
         * Update the config
         */
        setConfig: (config: typeof SetConfigInputSchema.Encoded) =>
          Schema.decodeUnknownEither(SetConfigInputSchema)(config).pipe(
            Either.map((validConfig) => {
              store.commit(systemTables.config.set(validConfig));
            }),
            Effect.catchTags({
              ParseError: (error: { message: string }) =>
                Effect.fail(
                  new InvalidSessionConfigError({
                    message: `Invalid config input: ${error.message}`,
                  }),
                ),
            }),
          ),
      };
    }),
    accessors: true,
  },
) {
  static Live = SessionStoreService.Default;

  static Test = Layer.succeed(
    SessionStoreService,
    new SessionStoreService({
      getConfig: () =>
        Effect.succeed({
          sessionID: undefined,
          isSyncEnabled: false,
        }),
      setConfig: (_config: typeof SetConfigInputSchema.Encoded) => Effect.void,
    }),
  );
}
