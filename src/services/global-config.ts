import { Config, Effect, Layer, LogLevel, Schema } from "effect";

import { EnvironmentSchema, LogLevelSchema } from "@/domain/model";
import { NoGlobalConfigError } from "@/domain/errors";
import { Livestore } from "./livestore";

/**
 * Global configuration service.
 *
 * Resolves environment variables and Livestore data into a shared app config.
 */
export class GlobalConfig extends Effect.Service<GlobalConfig>()(
  "@/services/global-config",
  {
    effect: Effect.gen(function* () {
      const { getConfig } = yield* Livestore;
      const { sessionID } = yield* getConfig();

      const env = yield* Config.string("NODE_ENV").pipe(
        Config.withDefault("development"),
        Effect.andThen(Schema.decodeUnknown(EnvironmentSchema)),
      );

      const logLevel = yield* Config.string("EXPO_PUBLIC_LOG_LEVEL").pipe(
        Config.withDefault("Debug"),
        Effect.andThen(Schema.decodeUnknown(LogLevelSchema)),
      );

      return {
        getConfig: () =>
          Effect.succeed({
            env,
            logLevel: LogLevel.fromLiteral(logLevel),
            sessionID,
          }),
      };
    }).pipe(
      Effect.catchTags({
        ParseError: () =>
          Effect.fail(
            new NoGlobalConfigError({
              message: "Failed to load global config",
            }),
          ),
        ConfigError: () =>
          Effect.fail(
            new NoGlobalConfigError({
              message: "Failed to read environment variables",
            }),
          ),
      }),
    ),
    dependencies: [Livestore.Live],
    accessors: true,
  },
) {
  static Test = Layer.succeed(
    GlobalConfig,
    new GlobalConfig({
      getConfig: () =>
        Effect.succeed({
          env: "development" as const,
          logLevel: LogLevel.Debug,
          sessionID: "mock-session-id",
        }),
    }),
  );

  static Live = GlobalConfig.Default;
}
