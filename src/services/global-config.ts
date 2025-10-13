import { Config, Context, Effect, Layer, LogLevel, Schema } from "effect";

import { EnvironmentSchema, LogLevelSchema } from "@/domain/model";
import { NoGlobalConfigError, NoLivestoreConfigError } from "@/domain/errors";
import { LivestoreConfig } from "./livestore-config";

const liveImplementation = Effect.gen(function* () {
  yield* Effect.logDebug("Using live global config");

  const env = yield* Config.string("NODE_ENV").pipe(
    Config.withDefault("development"),
    Effect.andThen((string) => Schema.decodeUnknown(EnvironmentSchema)(string)),
  );

  const logLevel = yield* Config.string("EXPO_PUBLIC_LOG_LEVEL").pipe(
    Config.withDefault("Debug"),
    Effect.andThen((string) => Schema.decodeUnknown(LogLevelSchema)(string)),
  );

  const { getConfig: getLivestoreConfig } = yield* LivestoreConfig;
  const { livestoreID } = yield* getLivestoreConfig();

  return {
    getConfig: () =>
      Effect.succeed({
        env,
        logLevel: LogLevel.fromLiteral(logLevel),
        livestoreID,
      }),
  };
}).pipe(
  Effect.catchTags({
    ParseError: ({ message }) =>
      Effect.fail(
        new NoGlobalConfigError({
          message: `Failed to parse global config with message: ${message}`,
        }),
      ),
    ConfigError: ({ message }) =>
      Effect.fail(
        new NoGlobalConfigError({
          message: `Failed to load environment config with message: ${message}`,
        }),
      ),
  }),
);

export class GlobalConfig extends Context.Tag("src/services/global-config")<
  GlobalConfig,
  {
    readonly getConfig: () => Effect.Effect<
      {
        readonly env: "development" | "production" | "test";
        readonly logLevel: LogLevel.LogLevel;
        readonly livestoreID: string;
      },
      NoGlobalConfigError | NoLivestoreConfigError
    >;
  }
>() {
  static Mock = Layer.effect(
    GlobalConfig,
    Effect.gen(function* () {
      yield* Effect.logDebug("Using mock global config");

      const { getConfig: getLivestoreConfig } = yield* LivestoreConfig;
      const { livestoreID } = yield* getLivestoreConfig();

      return {
        getConfig: () =>
          Effect.succeed({
            env: "development" as const,
            logLevel: LogLevel.Debug,
            livestoreID,
          }),
      };
    }),
  ).pipe(Layer.provide(LivestoreConfig.Mock));

  static Live = Layer.effect(GlobalConfig, liveImplementation).pipe(
    Layer.provide(LivestoreConfig.Live),
  );
}
