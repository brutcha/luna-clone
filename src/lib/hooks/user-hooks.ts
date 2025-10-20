import { useQuery } from "@livestore/react";
import { userById$ } from "@/lib/livestore/queries";
import { useSessionID } from "./auth-hooks";

/**
 * Hook to get the current user
 * Uses the current session ID to fetch the user from livestore
 */
export function useCurrentUser() {
  const sessionID = useSessionID();
  const user = useQuery(userById$(sessionID));
  return user;
}
