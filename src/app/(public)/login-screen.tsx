import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Linking,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
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

const LIME = "#9DC228";

const BEFORE_IMAGE = require("../../../assets/images/auth-page-images/login-img-user.png");
const AFTER_IMAGE = require("../../../assets/images/auth-page-images/login-img-taper-fade.png");

// Share of the screen height the before/after photo takes up.
const PHOTO_HEIGHT_RATIO = 0.66;

/**
 * Drives the lime line: 0 = fully "after", 1 = fully "before".
 * Starts in the middle, sweeps left, pauses, sweeps right, pauses, returns to the middle.
 */
function useRevealProgress() {
  const progress = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    let cancelled = false;

    const ease = Easing.inOut(Easing.ease);
    const move = (toValue: number, duration: number) =>
      Animated.timing(progress, { toValue, duration, easing: ease, useNativeDriver: true });

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled || reduceMotion) return; // stay split down the middle
      loop = Animated.loop(
        Animated.sequence([
          move(0, 2000),
          Animated.delay(1200),
          move(1, 2400),
          Animated.delay(1200),
          move(0.5, 1200),
        ]),
      );
      loop.start();
    });

    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [progress]);

  return progress;
}

function Tag({ label, side, lime }: { label: string; side: "left" | "right"; lime?: boolean }) {
  return (
    <View
      style={[
        {
          position: "absolute",
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 7,
          backgroundColor: lime ? LIME : "rgba(0,0,0,0.6)",
        },
        side === "left" ? { left: 20 } : { right: 20 },
      ]}
    >
      <Text
        className="font-jakarta-semibold text-xs"
        style={{ color: lime ? "#0b0b0b" : "#fff", letterSpacing: 1.2 }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function LoginScreen() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const photoHeight = Math.round(height * PHOTO_HEIGHT_RATIO);
  const progress = useRevealProgress();

  // Where the line sits, in px from the left edge.
  const revealX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, width] });
  const revealXNegative = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -width] });

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
            Alert.alert("Error signing in with Google", "Please try again in a moment.");
        }
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Before / after photo with sweeping reveal line */}
      <View
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: photoHeight, overflow: "hidden" }}
        pointerEvents="none"
      >
        <Image
          source={BEFORE_IMAGE}
          contentFit="cover"
          contentPosition={{ left: "30%", top: "40%" }}
          style={{ position: "absolute", width, height: photoHeight }}
          accessibilityLabel="Before: longer, swept-back hair"
        />

        {/* "After" layer: the window slides right with the line while the image
            slides left by the same amount, so the photo itself stays still. */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height: photoHeight,
            overflow: "hidden",
            transform: [{ translateX: revealX }],
          }}
        >
          <Animated.View style={{ transform: [{ translateX: revealXNegative }] }}>
            <Image
              source={AFTER_IMAGE}
              contentFit="cover"
              contentPosition="center"
              style={{ width, height: photoHeight }}
              accessibilityLabel="After: short skin fade"
            />
          </Animated.View>
        </Animated.View>

        {/* Lime reveal line */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: -1.5,
            width: 3,
            height: photoHeight,
            backgroundColor: LIME,
            shadowColor: LIME,
            shadowOpacity: 0.8,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
            transform: [{ translateX: revealX }],
          }}
        />

        {/* Darken under the status bar, and fade the photo into black */}
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "transparent"]}
          style={{ position: "absolute", left: 0, right: 0, top: 0, height: insets.top + 60 }}
        />
        <LinearGradient
          colors={["transparent", "#000"]}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: photoHeight * 0.43 }}
        />

        <View style={{ position: "absolute", left: 0, right: 0, top: insets.top + 16 }}>
          <Tag label="BEFORE" side="left" />
          <Tag label="AFTER" side="right" lime />
        </View>
      </View>

      <SafeAreaView className="flex-1" edges={["top", "bottom"]} pointerEvents="box-none">
        <View className="flex-1" pointerEvents="none" />

        <View className="px-6 pb-4" pointerEvents="box-none">
          <View className="flex-row items-center gap-2">
            <Ionicons name="sparkles" size={18} color={LIME} />
            <Text className="font-jakarta-semibold text-[15px]" style={{ color: LIME }}>
              Mantis
            </Text>
          </View>

          <Text
            className="mt-3.5 font-fraunces-semibold text-white"
            style={{ fontSize: 38, lineHeight: 40, letterSpacing: -0.6 }}
          >
            Try it on before{"\n"}you cut it.
          </Text>

          <Text className="mt-2.5 font-jakarta text-[15px] leading-[22px] text-zinc-400">
            Sign in to save your looks and pick up where you left off.
          </Text>

          <Pressable
            className="mt-6 h-14 flex-row items-center justify-center gap-3 rounded-full active:opacity-80"
            style={{ backgroundColor: LIME }}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
            onPress={googleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <>
                <ActivityIndicator color="#0b0b0b" />
                <Text className="font-jakarta-semibold text-base text-zinc-900">Signing in...</Text>
              </>
            ) : (
              <>
                <FontAwesome name="google" size={18} color="#0b0b0b" />
                <Text className="font-jakarta-semibold text-base text-zinc-900">
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>

          <Text className="mt-4 text-center font-jakarta text-xs text-zinc-500">
            By continuing, you agree to our {" "}
            <Text
              className="text-zinc-300 underline"
              accessibilityRole="link"
              onPress={() => Linking.openURL("https://bzay911.github.io/Mantis-terms-of-use/")}
            >
              Terms of Service
            </Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}