import { Effect } from "effect";

import { AppRuntime } from "@/services/runtime";

const createLoggerMethod =
  <T extends typeof Effect.log>(logger: T) =>
  (...args: Parameters<T>) =>
    logger(...args).pipe(
      Effect.catchAll(() => {
        console.error("AppLogger failed to log", ...args);

        return Effect.void;
      }),
      AppRuntime.runFork,
    );

export const AppLogger = {
  log: createLoggerMethod(Effect.log),
  debug: createLoggerMethod(Effect.logDebug),
  info: createLoggerMethod(Effect.logInfo),
  warn: createLoggerMethod(Effect.logWarning),
  error: createLoggerMethod(Effect.logError),
  fatal: createLoggerMethod(Effect.logFatal),
  trace: createLoggerMethod(Effect.logTrace),
};
