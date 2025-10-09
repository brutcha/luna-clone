import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

import "./global.css";

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <View className="flex-1 items-center justify-center">
        <Text className="text-4xl font-bold text-purple-900">Hello World!</Text>
      </View>
    </>
  );
}
