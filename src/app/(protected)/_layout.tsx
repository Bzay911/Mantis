import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import  Purchases  from "react-native-purchases";
import { Platform } from "react-native";
import { useEffect } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

export default function ProtectedLayout() {
  const queryClient = new QueryClient();
// useEffect(() => {
//   if (Platform.OS === "ios") {
//     Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUE_CAT_API_KEY || "" });
//   }
// },[]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="get-credits"
            options={{ presentation: "modal" }}
            />
          <Stack.Screen
            name="image-displayer"
            options={{ presentation: "modal" }}
            />
            </Stack>
      </KeyboardProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}