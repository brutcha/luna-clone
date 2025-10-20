import { PortalHost } from "@rn-primitives/portal";
import { StatusBar } from "expo-status-bar";
import { Suspense } from "react";
import { Text, View } from "react-native";

import { LivestoreProvider } from "@/lib/providers/livestore-provider";
import { CycleRing } from "@/components/cycle-ring/cycle-ring";
import { useCurrentUser } from "@/lib/hooks/user-hooks";
import "./global.css";

/**
 * Render the application's root component tree wrapped with the LiveStore provider.
 *
 * Renders a Suspense fallback while initializing, mounts LivestoreProvider with renderers
 * for loading, error, and shutdown states, and returns the main UI which includes the
 * StatusBar, a centered CycleRing (containing the Welcome component), and a PortalHost.
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
      <LivestoreProvider
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
      >
        <StatusBar style="auto" />
        <View className="flex-1 items-center justify-center">
          <CycleRing
            timelineLengthInDays={28}
            currentDay={8}
            phases={[
              {
                id: "menstrual",
                startDay: 0,
                lengthInDays: 8,
                color: "#ef4444",
              },
              {
                id: "follicular",
                startDay: 8,
                lengthInDays: 9,
                color: "#3b82f6",
              },
              {
                id: "ovulatory",
                startDay: 17,
                lengthInDays: 5,
                color: "#22c55e",
              },
              {
                id: "luteal",
                startDay: 22,
                lengthInDays: 6,
                color: "#eab308",
              },
            ]}
          >
            <Welcome />
          </CycleRing>
        </View>
        <PortalHost />
      </LivestoreProvider>
    </Suspense>
  );
}

const Welcome = () => {
  const user = useCurrentUser();

  return (
    <Text className="text-4xl font-bold text-purple-900">
      Hello {user?.name ?? "stranger"}!
    </Text>
  );
};