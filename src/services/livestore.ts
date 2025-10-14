import { Effect, Layer } from "effect";
import { createStorePromise, nanoid, Store } from "@livestore/livestore";

import { schema, tables } from "@/livestore/schema";
import { adapter } from "@/livestore/adapter";
import { config$ } from "@/livestore/queries";
import { NoLivestoreConfigError } from "@/domain/errors";

const STORE_ID = "@/services/livestore.storeID";

/**
 * Livestore service.
 *
 * Initializes the shared Livestore instance and exposes `getConfig()`
 * to read or initialize the persisted sync configuration.
 *
 * TODO: expose `store` for direct access to the Livestore instance.
 * TODO: store can't be initialized as livestore is not compatible with Expo v54
 */
export class Livestore extends Effect.Service<Livestore>()(
  "@/services/livestore",
  {
    scoped: Effect.gen(function* () {
      yield* Effect.logDebug("Using live livestore");

      const store = yield* Effect.acquireRelease(
        Effect.promise<Store<typeof schema>>(() =>
          createStorePromise({
            schema,
            adapter,
            storeId: STORE_ID,
          }),
        ),
        (store) => Effect.promise(() => store.shutdown()),
      );

      return {
        getConfig: () =>
          Effect.sync(() => {
            const config = store.query(config$);

            const sessionID = config.sessionID ?? nanoid();

            if (!config.sessionID) {
              store.commit(tables.config.set({ sessionID }));
            }

            return {
              ...config,
              sessionID,
            };
          }).pipe(
            Effect.catchAll(() =>
              Effect.fail(
                new NoLivestoreConfigError({
                  message: "Failed to load livestore config",
                }),
              ),
            ),
          ),
      };
    }),
    accessors: true,
  },
) {
  static Test = Layer.succeed(
    Livestore,
    new Livestore({
      getConfig: () =>
        Effect.succeed({
          sessionID: "mock-session-id",
          isSyncEnabled: false,
        }),
    }),
  );

  static Live = Livestore.Test;
}
