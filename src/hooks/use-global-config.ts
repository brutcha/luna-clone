import { use } from "react";
import { Effect } from "effect";

import { GlobalConfig } from "@/services/global-config";
import { AppRuntime } from "@/services/runtime";

export const useGlobalConfig = () => {
  const promise = Effect.gen(function* () {
    return yield* GlobalConfig.getConfig();
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logError("Failed to get global config", error).pipe(
        Effect.as(null),
      ),
    ),
    AppRuntime.runPromise,
  );

  return use(promise);
};
