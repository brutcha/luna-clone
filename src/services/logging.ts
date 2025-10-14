import { Console, Context, Effect, Layer, LogLevel, Logger } from "effect";
import { GlobalConfig } from "./global-config";

const makePrettyLogger = (logLevel: LogLevel.LogLevel) => {
  const pretty = Logger.prettyLogger({ mode: "auto" });

  return Layer.mergeAll(
    Layer.succeed(Logging, pretty),
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
export class Logging extends Context.Tag("src/services/logging")<
  Logging,
  Logger.Logger<unknown, unknown>
>() {
  static Test = Layer.succeed(Logging, Logger.defaultLogger);

  static Live = Layer.unwrapEffect(
    Effect.gen(function* () {
      const { env, logLevel } = yield* GlobalConfig.getConfig();

      if (env === "development" || env === "test") {
        return makePrettyLogger(logLevel);
      }

      return Layer.mergeAll(
        Layer.succeed(Logging, Logger.defaultLogger),
        Logger.minimumLogLevel(logLevel),
      );
    }),
  ).pipe(
    Layer.provide(GlobalConfig.Live),
    Layer.catchAll((error) => {
      Console.error("Failed to initialize live logger", error);

      return Layer.succeed(Logging, Logger.defaultLogger);
    }),
  );
}
