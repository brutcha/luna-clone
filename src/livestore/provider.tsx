import { nanoid } from "@livestore/livestore";
import { LiveStoreProvider } from "@livestore/react";
import { Text, unstable_batchedUpdates, View } from "react-native";
import type { ComponentProps, FC } from "react";

import { useGlobalConfig } from "@/hooks/use-global-config";
import { events, schema, tables } from "./schema";
import { adapter } from "./adapter";
import { config$ } from "./queries";

export const Provider: FC<
  Omit<
    ComponentProps<typeof LiveStoreProvider>,
    "storeId" | "boot" | "schema" | "adapter" | "batchUpdates"
  >
> = ({ children, ...props }) => {
  const config = useGlobalConfig();

  if (!config) {
    // TODO: create a fallback UI
    return (
      <View>
        <Text>Unexpected error</Text>
      </View>
    );
  }

  return (
    <LiveStoreProvider
      {...props}
      storeId={config.sessionID}
      schema={schema}
      adapter={adapter}
      batchUpdates={unstable_batchedUpdates}
      // TODO: remove database seeding once livestore service live is in use
      boot={(store) => {
        const config = store.query(config$);
        const sessionID = config.sessionID ?? nanoid();

        if (!config.sessionID) {
          store.commit(tables.config.set({ sessionID }));
        }

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
