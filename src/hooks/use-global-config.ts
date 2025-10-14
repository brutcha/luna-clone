import { use, useMemo } from "react";
import { Effect } from "effect";

import { GlobalConfig } from "@/services/global-config";
import { AppRuntime } from "@/services/runtime";

const program = Effect.gen(function* () {
  return yield* GlobalConfig.getConfig();
}).pipe(
  Effect.catchAll((error) =>
    Effect.logError("Failed to get global config", error).pipe(Effect.as(null)),
  ),
);

export const useGlobalConfig = () => {
  const promise = useMemo(() => AppRuntime.runPromise(program), []);

  return use(promise);
};
