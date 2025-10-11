import { LiveStoreProvider, useQuery } from "@livestore/react";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Text,
  unstable_batchedUpdates as batchUpdates,
  View,
} from "react-native";

import { schema } from "@/livestore/schema";
import { adapter } from "@/livestore/adapter";
import { user$ } from "@/livestore/queries";
import { getStoreID } from "@/effect/env";
import "./global.css";

export default function App() {
  return (
    <LiveStoreProvider
      schema={schema}
      adapter={adapter}
      storeId={getStoreID()}
      syncPayload={{ authToken: "insecure-token-change-me" }}
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
