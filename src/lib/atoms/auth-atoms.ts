import { Atom } from "@effect-atom/atom-react";
import { Effect, Layer } from "effect";

import { AuthService } from "@/lib/services/auth-service";
import { SessionStoreService } from "@/lib/services/session-store-service";

const AuthLayer = AuthService.Default.pipe(
  Layer.provide(SessionStoreService.Live),
);

const authRuntime: Atom.AtomRuntime<AuthService, never> =
  Atom.runtime(AuthLayer);

// TODO: make atom reactive to ensure it is changed on logout
export const sessionIDAtom = authRuntime.atom(
  Effect.gen(function* () {
    return yield* AuthService.getSessionID();
  }),
);
