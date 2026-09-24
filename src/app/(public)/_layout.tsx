// import { Stack } from "expo-router";

// export default function PublicLayout() {
//   return (
//     <>
//       <Stack screenOptions={{ headerShown: false }} />
//     </>
//   );
// }

import { Stack } from "expo-router";

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />

      <Stack.Screen
        name="onboarding"
        options={{
          gestureEnabled: true,
        }}
      />

      <Stack.Screen name="login-screen" />
    </Stack>
  );
}