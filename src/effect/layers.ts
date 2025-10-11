import { Context, Effect, LogLevel } from "effect";

export class GlobalConfig extends Context.Tag("Config")<
  GlobalConfig,
  {
    readonly getConfig: Effect.Effect<{
      readonly env: "development" | "production" | "test";
      readonly logLevel: LogLevel.LogLevel;
      readonly livestoreID: string;
    }>;
  }
>() {}
