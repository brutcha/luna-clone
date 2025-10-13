import { useQuery } from "@livestore/react";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Text,
  unstable_batchedUpdates as batchUpdates,
  View,
} from "react-native";

import { Provider as LiveStoreProvider } from "./livestore/provider";
import { adapter } from "@/livestore/adapter";
import { user$ } from "@/livestore/queries";
import { schema } from "@/livestore/schema";
import "./global.css";

/**
 * Root application component that mounts the LiveStoreProvider and main UI.
 *
 * When `livestoreID` is falsing, renders an error view. Otherwise configures and renders a
 * LiveStoreProvider with `schema`, `adapter`, `storeId`, a placeholder `syncPayload`, `batchUpdates`,
 * and custom `renderLoading`, `renderError`, and `renderShutdown` callbacks, then renders the
 * StatusBar and a centered Welcome component as the app content.
 *
 * @returns The root JSX element for the application.
 */
export default function App() {
  return (
    <LiveStoreProvider
      schema={schema}
      adapter={adapter}
      renderLoading={(_) => (
        <View>
          <Text>Loading LiveStore ({_.stage})...</Text>
        </View>
      )}
      renderError={(error: any) => (
        <View>
          <Text>Error: {error.toString()}</Text>
        </View>
      )}
      renderShutdown={() => (
        <View>
          <Text>LiveStore Shutdown</Text>
        </View>
      )}
      batchUpdates={batchUpdates}
    >
      <StatusBar style="auto" />
      <View className="flex-1 items-center justify-center">
        <Welcome />
      </View>
    </LiveStoreProvider>
  );
}

const Welcome = () => {
  const { name } = useQuery(user$);

  return (
    <Text className="text-4xl font-bold text-purple-900">Hello {name}!</Text>
  );
};
