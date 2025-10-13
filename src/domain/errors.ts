import { Data } from "effect";

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  readonly message: string;
}> {}

export class NoGlobalConfigError extends Data.TaggedError(
  "NoGlobalConfigError",
)<{
  readonly message: string;
}> {}

export class NoLivestoreConfigError extends Data.TaggedError(
  "NoLivestoreConfigError",
)<{
  readonly message: string;
}> {}
