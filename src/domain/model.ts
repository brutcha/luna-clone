import { Schema } from "effect";

export const EnvironmentSchema = Schema.Literal(
  "development",
  "production",
  "test",
).annotations({
  identifier: "Environment",
});

export type Environment = typeof EnvironmentSchema.Type;

export const LogLevelSchema = Schema.Literal(
  "All",
  "Fatal",
  "Error",
  "Warning",
  "Info",
  "Debug",
  "Trace",
  "None",
).annotations({
  identifier: "LogLevel",
});

export type LogLevel = typeof LogLevelSchema.Type;

export const EnviromentVariablesSchema = Schema.Struct({
  NODE_ENV: Schema.optional(EnvironmentSchema),
  EXPO_PUBLIC_LOG_LEVEL: Schema.optional(LogLevelSchema),
}).annotations({
  identifier: "EnviromentVariables",
});

export type EnviromentVariables = typeof EnviromentVariablesSchema.Type;
