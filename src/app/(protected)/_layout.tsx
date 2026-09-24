import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function ProtectedLayout() {
  return (
    <>
      <KeyboardProvider>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
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
    </>
  );
}
