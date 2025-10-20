import { Effect, Layer } from "effect";
import { createStorePromise, Store } from "@livestore/livestore";

import { schema } from "@/lib/livestore/schema";
import { adapter } from "@/lib/livestore/adapter";
import { AuthService } from "./auth-service";

/**
 * Livestore service - manages the per-user store lifecycle.
 *
 * Each user (identified by sessionID) gets their own isolated database.
 * This enables multi-tenancy where user data is completely separated.
 *
 * TODO: check data reactivity between a service and LivestoreProvider
 * ? In case data are not in sync, make sure data are readonly
 *
 * FIXME: getting sessionID is not reactive, the livestore instance won't
 * be updated when user logs out
 */
export class LivestoreService extends Effect.Service<LivestoreService>()(
  "@/services/livestore",
  {
    scoped: Effect.gen(function* () {
      const auth = yield* AuthService;
      const sessionID = yield* auth.getSessionID();

      yield* Effect.logDebug(
        `Initializing Livestore for session: ${sessionID}`,
      );

      const store = yield* Effect.acquireRelease(
        Effect.promise<Store<typeof schema>>(() =>
          createStorePromise({
            schema,
            adapter,
            storeId: `luna-${sessionID}`,
          }),
        ),
        (store) => Effect.promise(() => store.shutdown()),
      );

      return {
        store,
      };
    }),
    accessors: true,
  },
) {
  static Live = LivestoreService.Default;

  static Test = Layer.succeed(
    LivestoreService,
    new LivestoreService({
      store: null as any, // Mock store for tests
    }),
  );
}
