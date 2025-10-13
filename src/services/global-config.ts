import { Config, Context, Effect, Layer, LogLevel, Schema } from "effect";

import { EnvironmentSchema, LogLevelSchema } from "@/domain/model";
import { NoGlobalConfigError, NoLivestoreConfigError } from "@/domain/errors";
import { LivestoreConfig } from "./livestore-config";
import { Logging } from "./logger";

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
            logLevel: LogLevel.Info,
            livestoreID,
          }),
      };
    }),
  ).pipe(Layer.provide(LivestoreConfig.Mock));

  private static liveImplementation = Layer.effect(
    GlobalConfig,
    Effect.gen(function* () {
      yield* Effect.logDebug("Using live global config");

      const env = yield* Config.string("NODE_ENV").pipe(
        Config.withDefault("development"),
        Effect.andThen((string) =>
          Schema.encodeUnknown(EnvironmentSchema)(string),
        ),
      );
      const logLevel = yield* Config.string("EXPO_PUBLIC_LOG_LEVEL").pipe(
        Config.withDefault("Info"),
        Effect.andThen((string) =>
          Schema.encodeUnknown(LogLevelSchema)(string),
        ),
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
      Effect.catchTag("ParseError", ({ message }) =>
        Effect.fail(
          new NoGlobalConfigError({
            message: `Failed to parse global config with message: ${message}`,
          }),
        ),
      ),
    ),
  );

  static Live = Layer.provide(this.liveImplementation, LivestoreConfig.Live);
}

export const getGlobalConfigOrNull = () =>
  Effect.gen(function* () {
    const { getConfig } = yield* GlobalConfig;

    return yield* getConfig();
  }).pipe(
    Effect.provide(Layer.mergeAll(GlobalConfig.Live, Logging.Live)),
    Effect.catchTags({
      NoGlobalConfigError: ({ message }) =>
        Effect.gen(function* () {
          yield* Effect.logWarning("Failed to get global config", message);

          return null;
        }),
      NoLivestoreConfigError: ({ message }) =>
        Effect.gen(function* () {
          yield* Effect.logWarning("Failed to get livestore config", message);

          return null;
        }),
    }),
    Effect.runSync,
  );
