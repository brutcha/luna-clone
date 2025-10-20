import { Effect, Layer } from "effect";
import { createStorePromise, Store } from "@livestore/livestore";

import { adapter } from "@/lib/livestore/adapter";
import { systemSchema, systemTables } from "@/lib/livestore/system-schema";

/**
 * SessionStore service - manages session and app configuration persistence.
 *
 * This is a pure storage layer for system-wide data (sessionID, sync settings).
 * Business logic for session creation/management belongs in User or Auth services.
 */
export class SessionStoreService extends Effect.Service<SessionStoreService>()(
  "@/services/session-store",
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
        setConfig: (config: { sessionID?: string; isSyncEnabled?: boolean }) =>
          Effect.sync(() => {
            store.commit(systemTables.config.set(config));
          }),

        /**
         * Direct access to the system store for advanced usage
         */
        store,
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
      setConfig: () => Effect.void,
      store: null as any,
    }),
  );
}
