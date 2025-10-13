import { LiveStoreProvider } from "@livestore/react";
import { use, useMemo } from "react";
import { Text, View } from "react-native";
import { Effect } from "effect";
import type { ComponentProps, FC } from "react";

import { GlobalConfig } from "@/services/global-config";
import { AppRuntime } from "@/services/runtime";

export const globalConfigOrNull = Effect.gen(function* () {
  const { getConfig } = yield* GlobalConfig;

  return yield* getConfig();
}).pipe(
  Effect.catchTags({
    NoGlobalConfigError: ({ message }) =>
      Effect.gen(function* () {
        yield* Effect.logWarning("Failed to get global config", message);

        return null;
      }),
    NoLivestoreConfigError: ({ message }) =>
      Effect.gen(function* () {
        yield* Effect.logWarning("Failed to get livestore config", message);

        return null;
      }),
  }),
);

export const Provider: FC<
  Omit<ComponentProps<typeof LiveStoreProvider>, "storeId">
> = ({ children, ...props }) => {
  const config = use(
    // TODO: find out if memoization is needed once react compiler set-up
    useMemo(() => AppRuntime.runPromise(globalConfigOrNull), []),
  );

  if (!config) {
    // TODO: create a fallback UI
    return (
      <View>
        <Text>Unexpected error</Text>
      </View>
    );
  }

  return (
    <LiveStoreProvider {...props} storeId={config.livestoreID}>
      {children}
    </LiveStoreProvider>
  );
};
