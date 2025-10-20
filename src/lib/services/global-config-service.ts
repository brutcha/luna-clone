import { Config, Effect, Layer, LogLevel, Schema } from "effect";

import { EnvironmentSchema, LogLevelSchema } from "@/lib/services/domain/model";
import { NoGlobalConfigError } from "@/lib/services/domain/errors";

/**
 * Global configuration service.
 *
 * Resolves environment variables into a shared app config.
 */
export class GlobalConfigService extends Effect.Service<GlobalConfigService>()(
  "@/lib/services/global-config",
  {
    effect: Effect.gen(function* () {
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
    accessors: true,
  },
) {
  static Test = Layer.succeed(
    GlobalConfigService,
    new GlobalConfigService({
      getConfig: () =>
        Effect.succeed({
          env: "development" as const,
          logLevel: LogLevel.Debug,
        }),
    }),
  );

  static Live = GlobalConfigService.Default;
}
