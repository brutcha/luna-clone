import { nanoid } from "@livestore/livestore";
import { Effect, Layer } from "effect";

import { SessionStoreService } from "./session-store-service";
import {
  AuthenticationError,
  InvalidSessionConfigError,
} from "./domain/errors";

/**
 * Auth service - manages authentication and session lifecycle.
 *
 * Responsible for:
 * - Creating and managing sessions (sessionID)
 * - User authentication (login/logout)
 * TODO: Token management for sync
 *
 * SessionID behavior:
 * - Anonymous users: Generated locally and persisted
 * - Authenticated users: sessionID === userId for cross-device sync
 */
export class AuthService extends Effect.Service<AuthService>()(
  "@/lib/services/auth",
  {
    effect: Effect.gen(function* () {
      const sessionStore = yield* SessionStoreService;

      return {
        /**
         * Get the current session ID (lazily creates if doesn't exist)
         */
        getSessionID: () =>
          Effect.gen(function* () {
            const config = yield* sessionStore.getConfig();

            if (config.sessionID) {
              return config.sessionID;
            }

            // Create new anonymous session
            const sessionID = nanoid();
            yield* sessionStore.setConfig({ sessionID });
            yield* Effect.logInfo(`Anonymous session created: ${sessionID}`);

            return sessionID;
          }).pipe(
            Effect.catchTags({
              InvalidSessionConfigError: (error: InvalidSessionConfigError) =>
                Effect.fail(
                  new AuthenticationError({
                    message: `Failed to create session with error: ${error.message}`,
                  }),
                ),
            }),
          ),

        /**
         * Login with userId (sets sessionID = userId for sync)
         */
        login: (userId: string) =>
          Effect.gen(function* () {
            yield* sessionStore.setConfig({
              sessionID: userId,
              isSyncEnabled: true,
            });
            yield* Effect.logInfo(`User logged in: ${userId}`);
          }).pipe(
            Effect.catchTags({
              InvalidSessionConfigError: (error: InvalidSessionConfigError) =>
                Effect.fail(
                  new AuthenticationError({
                    message: `Failed to login with error: ${error.message}`,
                  }),
                ),
            }),
          ),

        /**
         * Logout (creates new anonymous session)
         */
        logout: () =>
          Effect.gen(function* () {
            const newSessionID = nanoid();
            yield* sessionStore.setConfig({
              sessionID: newSessionID,
              isSyncEnabled: false,
            });
            yield* Effect.logInfo(
              `User logged out, new session: ${newSessionID}`,
            );
          }).pipe(
            Effect.catchTags({
              InvalidSessionConfigError: (error: InvalidSessionConfigError) =>
                Effect.fail(
                  new AuthenticationError({
                    message: `Failed to logout with error: ${error.message}`,
                  }),
                ),
            }),
          ),
      };
    }),
    accessors: true,
  },
) {
  static Test = Layer.succeed(
    AuthService,
    new AuthService({
      getSessionID: () => Effect.succeed("test-session-id"),
      login: () => Effect.void,
      logout: () => Effect.void,
    }),
  );

  static Live = AuthService.Default;
}
