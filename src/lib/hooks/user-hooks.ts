import { useQuery } from "@livestore/react";
import { userById$ } from "@/lib/livestore/queries";
import { useSessionID } from "./auth-hooks";

/**
 * Provides the query result for the current authenticated user.
 *
 * @returns The user object, or null if session ID is not available, or user
 * is not found.
 */
export function useCurrentUser() {
  const sessionID = useSessionID();
  return useQuery(userById$(sessionID));
}
