import { Context, Effect, Layer, LogLevel, Logger } from "effect";
import { GlobalConfigService } from "./global-config-service";

const makePrettyLogger = (logLevel: LogLevel.LogLevel) => {
  const pretty = Logger.prettyLogger({ mode: "auto" }).pipe(
    Logger.withLeveledConsole,
  );

  return Layer.mergeAll(
    Layer.succeed(LoggingService, pretty),
    Logger.replace(Logger.defaultLogger, pretty),
    Logger.minimumLogLevel(logLevel),
  );
};

/**
 * Logging service.
 * Provides a logger configured from global configuration.
 *
 * TODO: Implement remote logging, for example by using sentry
 */
export class LoggingService extends Context.Tag("src/services/logging")<
  LoggingService,
  Logger.Logger<unknown, unknown>
>() {
  static Test = Layer.succeed(LoggingService, Logger.defaultLogger);

  static Live = Layer.unwrapEffect(
    Effect.gen(function* () {
      const { env, logLevel } = yield* GlobalConfigService.getConfig();

      if (env === "development" || env === "test") {
        return makePrettyLogger(logLevel);
      }

      return Layer.mergeAll(
        Layer.succeed(LoggingService, Logger.defaultLogger),
        Logger.minimumLogLevel(logLevel),
      );
    }),
  ).pipe(
    Layer.catchAll((error) => {
      Effect.logError("Failed to initialize logging", error).pipe(
        Effect.as(Effect.void),
      );

      return Layer.succeed(LoggingService, Logger.defaultLogger);
    }),
  );
}
