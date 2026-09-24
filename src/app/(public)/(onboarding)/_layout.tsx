import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="user-image-picker" />

      <Stack.Screen name="inspiration-image-picker" />
    </Stack>
  );
}