import { use, useMemo } from "react";
import { Effect } from "effect";

import { GlobalConfig } from "@/services/global-config";
import { AppRuntime } from "@/services/runtime";

export const useGlobalConfig = () => {
  // TODO: Check if useMemo is required once react compiler is set-up
  const promise = useMemo(
    () =>
      Effect.gen(function* () {
        return yield* GlobalConfig.getConfig();
      }).pipe(
        Effect.catchAll((error) =>
          Effect.logError("Failed to get global config", error).pipe(
            Effect.as(null),
          ),
        ),
        AppRuntime.runPromise,
      ),
    [],
  );

  return use(promise);
};
