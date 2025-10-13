import { LiveStoreProvider } from "@livestore/react";
import { use, useMemo } from "react";
import { Text, View } from "react-native";
import type { ComponentProps, FC } from "react";

import { getGlobalConfigOrNull } from "@/services/global-config";

export const Provider: FC<
  Omit<ComponentProps<typeof LiveStoreProvider>, "storeId">
> = ({ children, ...props }) => {
  // TODO: find out if needed once react compiler is enabled
  const config = use(useMemo(() => getGlobalConfigOrNull(), []));

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
