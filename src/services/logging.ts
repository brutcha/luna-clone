import { Context, Logger } from "effect";

export class Logging extends Context.Tag("src/services/logging")<
  Logging,
  Logger.Logger<string, void>
>() {
  static Mock = Logger.replace(
    Logger.defaultLogger,
    Logger.make(({ logLevel, message }) => {
      switch (logLevel._tag) {
        case "Debug":
          console.debug(message);
          break;
        case "Info":
          console.info(message);
          break;
        case "Warning":
          console.warn(message);
          break;
        case "Error":
          console.error(message);
          break;
        case "Fatal":
          console.error(message);
          break;
        default:
          console.log(message);
          break;
      }
    }),
  );

  /**
   * TODO: Implement logger service
   * ? Find out if it could be a singleton
   * ? Should log to console on dev and test
   * ? Should log to file on prod
   * ? Should log to sentry when sentry is enabled
   */
  static Live = Logging.Mock;
}
