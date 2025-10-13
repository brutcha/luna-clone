import { Context, Effect, Layer } from "effect";

import { NoLivestoreConfigError } from "@/domain/errors";

export class LivestoreConfig extends Context.Tag(
  "src/services/livestore-config",
)<
  LivestoreConfig,
  {
    readonly getConfig: () => Effect.Effect<
      {
        readonly livestoreID: string;
        readonly isSyncEnabled: boolean;
      },
      NoLivestoreConfigError
    >;
  }
>() {
  static Mock = Layer.effect(
    LivestoreConfig,
    Effect.gen(function* () {
      yield* Effect.logDebug("Using mock livestore config");

      return {
        getConfig: () =>
          Effect.succeed({
            livestoreID: "mock-livestore-id",
            isSyncEnabled: false,
          }),
      };
    }),
  );

  /**
   * TODO: implement LivestoreConfig implementation
   * ? should get config from a persistent secure storage, possibly a keychain or sqlite
   * ? If not found, create a new one and store it
   */
  static Live = LivestoreConfig.Mock;
}
