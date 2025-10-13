import { useQuery } from "@livestore/react";
import { StatusBar } from "expo-status-bar";
import { Suspense } from "react";
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
 * Mounts the LiveStore provider and renders the app's root UI.
 *
 * The provider is configured with the application schema, adapter, lifecycle renderers for
 * loading, error, and shutdown states, and uses batched updates. Inside the provider this
 * component renders the StatusBar and a centered Welcome component.
 *
 * @returns The root JSX element for the application
 */
export default function App() {
  return (
    <Suspense
      // TODO: implement a splash screen
      fallback={
        <View>
          <Text>Loading...</Text>
        </View>
      }
    >
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
    </Suspense>
  );
}

const Welcome = () => {
  const { name } = useQuery(user$);

  return (
    <Text className="text-4xl font-bold text-purple-900">Hello {name}!</Text>
  );
};