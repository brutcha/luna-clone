import { LiveStoreProvider } from "@livestore/react";
import { View } from "react-native";
import type { ComponentProps, FC } from "react";

import { getGlobalConfigOrNull } from "@/services/global-config";

export const Provider: FC<
  Omit<ComponentProps<typeof LiveStoreProvider>, "storeId">
> = ({ children, ...props }) => {
  const config = getGlobalConfigOrNull();

  if (!config) {
    // TODO: create a fallback UI
    return <View>Unexpected error</View>;
  }

  return (
    <LiveStoreProvider {...props} storeId={config.livestoreID}>
      {children}
    </LiveStoreProvider>
  );
};
