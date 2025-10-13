import { Context, Effect, Layer, LogLevel, Logger } from "effect";
import { GlobalConfig } from "./global-config";

const makePrettyLogger = (logLevel: LogLevel.LogLevel) => {
  const pretty = Logger.prettyLogger({ mode: "auto" });

  return Layer.mergeAll(
    Layer.succeed(Logging, pretty),
    Logger.replace(Logger.defaultLogger, pretty),
    Logger.minimumLogLevel(logLevel),
  );
};
export class Logging extends Context.Tag("src/services/logging")<
  Logging,
  Logger.Logger<unknown, unknown>
>() {
  static Mock = makePrettyLogger(LogLevel.Debug);

  static Live = Layer.unwrapEffect(
    Effect.gen(function* () {
      yield* Effect.logDebug("Using live logger");

      const { getConfig } = yield* GlobalConfig;
      const { env, logLevel } = yield* getConfig();

      if (env === "development" || env === "test") {
        return makePrettyLogger(logLevel);
      }

      // TODO: Implement remote logging, sentry for example
      return Logger.minimumLogLevel(logLevel);
    }),
  ).pipe(
    Layer.provide(GlobalConfig.Live),
    Layer.catchAll((error) => {
      console.error("Failed to initialize live logger", error);

      return Layer.succeed(Logging, Logger.defaultLogger);
    }),
  );
}
