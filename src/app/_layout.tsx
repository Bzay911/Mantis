import "../global.css";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import { ActivityIndicator, Platform, useColorScheme, View } from "react-native";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import {useAuth, AuthProvider} from "../../contexts/auth-context";
import Purchases from "react-native-purchases";
import { useEffect } from "react";

  function RootLayoutWithAuth() {
    const {accessToken, loading} = useAuth();
    
    if (loading) {
      return null;
    }

    return (
      <Stack>
        <Stack.Protected guard={!!accessToken}>
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!accessToken}>
          <Stack.Screen name="(public)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    );
  }

export default function TabLayout() {
  const colorScheme = useColorScheme();
const [fontsLoaded] = useFonts({
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
});

  useEffect(() => {
  if (Platform.OS === 'ios') {
    Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUE_CAT_API_KEY || '' });
  }
}, []);

    if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AuthProvider>
        <RootLayoutWithAuth />
      </AuthProvider>
    </ThemeProvider>
  );
}
