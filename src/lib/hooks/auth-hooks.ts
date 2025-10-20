import { useAtomSuspense } from "@effect-atom/atom-react";
import { sessionIDAtom } from "@/lib/atoms/auth-atoms";

export function useSessionID(): string {
  const { value: sessionID } = useAtomSuspense(sessionIDAtom);
  return sessionID;
}
