import { use, useMemo } from "react";
import { Effect } from "effect";

import { GlobalConfig } from "@/services/global-config";
import { AppRuntime } from "@/services/runtime";
import { AppLogger } from "@/helpers/app-logger";

const program = Effect.gen(function* () {
  return yield* GlobalConfig.getConfig();
}).pipe(
  Effect.catchAll((error) => {
    AppLogger.error("Failed to get global config", error);

    return Effect.succeed(null);
  }),
);

export const useGlobalConfig = () => {
  const promise = useMemo(() => AppRuntime.runPromise(program), []);

  return use(promise);
};
