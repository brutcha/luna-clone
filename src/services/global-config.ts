import { Config, Context, Effect, Layer, LogLevel, Schema } from "effect";

import {
  EnviromentVariablesSchema,
  EnvironmentSchema,
  LogLevelSchema,
} from "@/domain/model";
import { NoGlobalConfigError, NoLivestoreConfigError } from "@/domain/errors";
import { LivestoreConfig } from "./livestore-config";

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

      const { getConfig: getLivestoreConfig } = yield* LivestoreConfig;

      // TODO: find out if parsing the process.env is needed, Config.string('ENV_VARIABLE') may work on it's own
      const { NODE_ENV, EXPO_PUBLIC_LOG_LEVEL } = yield* Schema.decodeUnknown(
        EnviromentVariablesSchema,
      )(process.env);

      const env = yield* Schema.encodeUnknownOption(EnvironmentSchema)(
        Config.string("ENV").pipe(
          Config.withDefault(NODE_ENV ?? "development"),
        ),
      );
      const logLevel = yield* Schema.encodeUnknownOption(LogLevelSchema)(
        Config.string("LOG_LEVEL").pipe(
          Config.withDefault(EXPO_PUBLIC_LOG_LEVEL ?? "Info"),
        ),
      );

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
        NoSuchElementException: ({ message }) =>
          Effect.fail(
            new NoGlobalConfigError({
              message: `Failed to get global config with message: ${message}`,
            }),
          ),
        ParseError: ({ message }) =>
          Effect.fail(
            new NoGlobalConfigError({
              message: `Failed to parse global config with message: ${message}`,
            }),
          ),
      }),
    ),
  );

  static Live = Layer.provide(this.liveImplementation, LivestoreConfig.Live);
}

export const getGlobalConfigOrNull = () =>
  Effect.gen(function* () {
    const { getConfig } = yield* GlobalConfig;

    return yield* getConfig();
  }).pipe(
    Effect.provide(GlobalConfig.Live),
    Effect.catchTags({
      NoGlobalConfigError({ message }) {
        Effect.logWarning("Failed to get global config", message);

        return Effect.succeed(null);
      },
      NoLivestoreConfigError({ message }) {
        Effect.logWarning("Failed to get livestore config", message);

        return Effect.succeed(null);
      },
    }),
    Effect.runSync,
  );
