import { Result, useAtomValue } from "@effect-atom/atom-react";
import { sessionIDAtom } from "@/lib/atoms/auth-atoms";

/**
 * Accesses the current session ID stored in the session atom.
 *
 * @returns The current session ID string or null when session ID is
 * not available.
 */
export function useSessionID(): string | null {
  const sessionID = useAtomValue(sessionIDAtom);

  if (Result.isSuccess(sessionID)) {
    return sessionID.value;
  }

  return null;
}
