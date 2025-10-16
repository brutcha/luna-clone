import { use, useMemo } from "react";
import { Effect } from "effect";

import { GlobalConfig } from "@/services/global-config";
import { AppRuntime } from "@/services/runtime";

export const useGlobalConfig = () => {
  /**
   * ? Manual useMemo is required because the React Compiler won't automatically
   * ? memoize promise creation, as it's considered a side effect that might not
   * ? be idempotent (safe to run multiple times with the same result).
   * ? The use() hook requires the exact same promise instance across renders to
   * ? avoid "uncached promise" errors.
   */
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
