import { Context, Effect, Layer } from "effect";

import {
  NoGlobalConfigError,
  NoLivestoreConfigError,
  UnauthorizedError,
} from "@/domain/errors";
import { LivestoreConfig } from "./livestore-config";

export class AuthClient extends Context.Tag("src/services/auth-client")<
  AuthClient,
  {
    readonly getToken: () => Effect.Effect<
      string,
      UnauthorizedError | NoLivestoreConfigError | NoGlobalConfigError
    >;
  }
>() {
  static Mock = Layer.effect(
    AuthClient,
    Effect.gen(function* () {
      yield* Effect.logDebug("Using mock auth client");

      const { getConfig } = yield* LivestoreConfig;

      return AuthClient.of({
        getToken: () =>
          Effect.gen(function* () {
            const { isSyncEnabled } = yield* getConfig();

            if (isSyncEnabled) {
              return yield* Effect.fail(
                new UnauthorizedError({
                  message:
                    "Mock AuthClient: sync is enabled but auth tokens are not available in mock mode. Disable sync or use Live implementation.",
                }),
              );
            }

            return "mock-token";
          }),
      });
    }),
  ).pipe(Layer.provide(LivestoreConfig.Mock));

  // TODO: implement AuthClient implementation
  static Live = AuthClient.Mock;
}
