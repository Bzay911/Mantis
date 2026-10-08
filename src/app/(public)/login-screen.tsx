import {
  Pressable,
  Text,
  View,
  Alert,
  ActivityIndicator,
  FlatList,
  Linking,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useAuth } from "../../../contexts/auth-context";
import { API_BASE_URL } from "../../constants/api-config";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

const BACKGROUNDS = [
  require("../../../assets/images/auth-page-images/sign-in-image1.jpg"),
  require("../../../assets/images/auth-page-images/sign-in-image2.jpg"),
  require("../../../assets/images/auth-page-images/sign-in-image3.jpg"),
];

const AUTO_ADVANCE_MS = 6000;

export default function LoginScreen() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const { width, height } = useWindowDimensions();

  const listRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Schedule the next slide whenever the active slide changes. Because it
  // depends on activeIndex, a manual swipe automatically restarts the timer.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = (activeIndex + 1) % BACKGROUNDS.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const handleGoogleSignin = async (idToken: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/handle-google-auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("Login failed", data.message);
        return;
      }
      const { accessToken, refreshToken, user } = data;
      await login(accessToken, refreshToken, user);
    } catch (error) {
      console.log(`error from handleSignin: ${error}`);
    }
  };

  const googleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        console.log("Google Sign-In successful. ID Token:", idToken);
        if (!idToken) return;
        await handleGoogleSignin(idToken);
      } else {
        console.log(`Sign in cancelled by user: ${response.data}`);
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log("Login in progress", error.message);
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log("Play service not available", error.message);
            break;
          default:
            Alert.alert(
              "Error signing in with Google",
              "Please proceed using email and password.",
            );
        }
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Swipeable background */}
      <FlatList
        ref={listRef}
        data={BACKGROUNDS}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={handleScrollEnd}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        renderItem={({ item }) => (
          <Image source={item} contentFit="cover" style={{ width, height }} />
        )}
      />

      {/* Gradient keeps the text readable on any photo. pointerEvents="none"
          lets swipes pass through to the list underneath. */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.92)"]}
        locations={[0, 0.55, 1]}
        className="absolute inset-0"
        pointerEvents="none"
      />

      <SafeAreaView
        className="flex-1"
        edges={["top", "bottom"]}
        pointerEvents="box-none"
      >
        {/* Spacer pushes everything below to the bottom third */}
        <View className="flex-1" pointerEvents="none" />

        <View className="gap-6 px-6 pb-4" pointerEvents="box-none">
          {/* Page dots */}
          <View className="flex-row gap-2">
            {BACKGROUNDS.map((_, i) => (
              <View
                key={i}
                className={`h-1.5 rounded-full ${
                  i === activeIndex ? "w-6 bg-[#9DC228]" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </View>

          <View className="gap-2">
            <Text className="text-[34px] font-fraunces-semibold leading-tight text-white">
              Welcome back
            </Text>
            <Text className="text-base text-zinc-300 font-jakarta">
              Sign in to your Mantis AI account
            </Text>
          </View>

          <Pressable
            className="flex-row items-center justify-center gap-3 rounded-2xl bg-[#9DC228] px-4 py-4 active:opacity-80"
            accessibilityRole="button"
            onPress={googleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <>
                <ActivityIndicator color="#1a1a1a" />
                <Text className="text-base font-jakarta-semibold text-zinc-900">
                  Signing in...
                </Text>
              </>
            ) : (
              <>
                <FontAwesome name="google" size={18} color="#1a1a1a" />
                <Text className="text-base font-jakarta-semibold text-zinc-900">
                  Sign in with Google
                </Text>
              </>
            )}
          </Pressable>

          <Text className="text-center text-sm font-jakarta text-white">
            By continuing, you agree to our{" "}
            <Text
              className="font-semibold text-white underline"
              onPress={() =>
                Linking.openURL("https://bzay911.github.io/Mantis-terms-of-use/")
              }
            >
              Terms of Service
            </Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}