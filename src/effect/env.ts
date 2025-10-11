import { Effect, Layer, LogLevel, Schema } from "effect";

import { GlobalConfig } from "./layers";

const envSchema = Schema.Struct({
  NODE_ENV: Schema.optional(
    Schema.Literal("development", "production", "test"),
  ),
  EXPO_PUBLIC_LOG_LEVEL: Schema.optional(
    Schema.Literal(
      "All",
      "Fatal",
      "Error",
      "Warning",
      "Info",
      "Debug",
      "Trace",
      "None",
    ),
  ),
  EXPO_PUBLIC_LIVESTORE_STORE_ID: Schema.String.pipe(Schema.minLength(8)),
});

export const configLive = Layer.effect(
  GlobalConfig,
  Effect.gen(function* () {
    const { NODE_ENV, EXPO_PUBLIC_LOG_LEVEL, EXPO_PUBLIC_LIVESTORE_STORE_ID } =
      yield* Schema.decodeUnknown(envSchema)(process.env);

    return GlobalConfig.of({
      getConfig: Effect.sync(() => ({
        env: NODE_ENV ?? "development",
        logLevel: LogLevel.fromLiteral(EXPO_PUBLIC_LOG_LEVEL ?? "Info"),
        storeID: EXPO_PUBLIC_LIVESTORE_STORE_ID,
      })),
    });
  }),
);

export const getStoreID = () =>
  Effect.runSync(
    Effect.provide(
      Effect.gen(function* () {
        const { getConfig } = yield* GlobalConfig;
        const { storeID } = yield* getConfig;

        return storeID;
      }),
      configLive,
    ),
  );
