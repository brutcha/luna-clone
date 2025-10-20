import { Data } from "effect";

export class AuthenticationError extends Data.TaggedError(
  "AuthenticationError",
)<{
  readonly message: string;
}> {}

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  readonly message: string;
}> {}

export class NoGlobalConfigError extends Data.TaggedError(
  "NoGlobalConfigError",
)<{
  readonly message: string;
}> {}

export class InvalidSessionConfigError extends Data.TaggedError(
  "InvalidSessionConfigError",
)<{
  readonly message: string;
}> {}
