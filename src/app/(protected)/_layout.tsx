import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useOnboardingStore } from "../../../store/onboarding-store";

export default function ProtectedLayout() {
  const router = useRouter();
  const pendingGeneration = useOnboardingStore((s) => s.pendingGeneration);

  useEffect(() => {
    if (pendingGeneration) {
      router.push("/(protected)/ai-page");
    }
  }, []); 

  return (
    <KeyboardProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="get-credits" options={{ presentation: "modal" }} />
        <Stack.Screen name="generated-image-displayer" />
        <Stack.Screen name="image-displayer" />
        <Stack.Screen name="camera-capture-screen" />
      </Stack>
    </KeyboardProvider>
  );
}