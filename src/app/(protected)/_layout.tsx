import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

export default function ProtectedLayout() {
  const queryClient = new QueryClient();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <Stack
            screenOptions={{ headerShown: false }}
            initialRouteName="(tabs)"
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="get-credits"
              options={{ presentation: "modal" }}
            />
            <Stack.Screen name="generated-image-displayer" />
            <Stack.Screen name="image-displayer" />
            <Stack.Screen name="camera-capture-screen" />
          </Stack>
        </KeyboardProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
