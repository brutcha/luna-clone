import { Effect } from "effect";

import { UnauthorizedError } from "@/domain/errors";
import { Livestore } from "./livestore";
import { GlobalConfig } from "./global-config";

/**
 * AuthClient service.
 *
 * TODO: Implement live auth client.
 */
export class AuthClient extends Effect.Service<AuthClient>()(
  "@/services/auth-client",
  {
    effect: Effect.gen(function* () {
      const { isSyncEnabled } = yield* Livestore.getConfig();
      const { env } = yield* GlobalConfig.getConfig();

      return {
        getToken: () =>
          Effect.gen(function* () {
            if (isSyncEnabled && env === "test") {
              return "mock-token";
            }

            if (isSyncEnabled) {
              return yield* Effect.fail(
                new UnauthorizedError({
                  message:
                    "Mock AuthClient: sync is enabled but auth tokens are not available in mock mode. Disable sync or use Live implementation.",
                }),
              );
            }

            return null;
          }),
      };
    }),
    dependencies: [Livestore.Live, GlobalConfig.Live],
    accessors: true,
  },
) {
  static Test = AuthClient.Default;

  static Live = AuthClient.Test;
}
