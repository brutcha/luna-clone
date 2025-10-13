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
  "Fatal",
  "Error",
  "Warning",
  "Info",
  "Debug",
  "Trace",
).annotations({
  identifier: "LogLevel",
});

export type LogLevel = typeof LogLevelSchema.Type;
