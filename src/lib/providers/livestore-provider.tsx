import { LiveStoreProvider } from "@livestore/react";
import { Text, unstable_batchedUpdates, View } from "react-native";
import type { ComponentProps, FC } from "react";

import { events, schema, tables } from "@/lib/livestore/schema";
import { adapter } from "@/lib/livestore/adapter";
import { useSessionID } from "@/lib/hooks/auth-hooks";

/**
 * Livestore provider that manages the per-user store lifecycle.
 */
export const LivestoreProvider: FC<
  Omit<
    ComponentProps<typeof LiveStoreProvider>,
    "storeId" | "boot" | "schema" | "adapter" | "batchUpdates"
  >
> = ({ children, ...props }) => {
  const sessionID = useSessionID();

  if (!sessionID) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <LiveStoreProvider
      {...props}
      storeId={`luna-${sessionID}`}
      schema={schema}
      adapter={adapter}
      batchUpdates={unstable_batchedUpdates}
      boot={(store) => {
        // TODO: redirect to create user screen instead of creating one
        if (store.query(tables.users.where("id", sessionID).count()) === 0) {
          store.commit(
            events.userCreated({
              id: sessionID,
              name: "Dev User",
              createdAt: new Date(),
            }),
          );
        }
      }}
    >
      {children}
    </LiveStoreProvider>
  );
};
