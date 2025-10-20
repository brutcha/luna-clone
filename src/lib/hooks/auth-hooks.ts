import { Result, useAtomValue } from "@effect-atom/atom-react";
import { sessionIDAtom } from "@/lib/atoms/auth-atoms";

export function useSessionID(): string | null {
  const sessionID = useAtomValue(sessionIDAtom);

  if (Result.isInitial(sessionID)) {
    return null;
  }

  if (Result.isSuccess(sessionID)) {
    return sessionID.value;
  }

  return null;
}
