import "../global.css";
import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import { Platform, useColorScheme } from "react-native";
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
  
    useEffect(() => {
    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUE_CAT_API_KEY || '' });
    }
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AuthProvider>
        <RootLayoutWithAuth />
      </AuthProvider>
    </ThemeProvider>
  );
}
