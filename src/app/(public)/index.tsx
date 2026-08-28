import { useRouter } from "expo-router";
import {
  Pressable,
  Text,
  View,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useAuth } from "../../../contexts/auth-context";
import { API_BASE_URL } from "../../constants/api-config";

export default function SignIn() {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();

  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  const handleGoogleSignin = async (idToken: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/handle-google-auth`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        console.log("Login failed", data.message);
        return;
      }
      const { accessToken, refreshToken, user } = data;
      login(accessToken, refreshToken, user);
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
    <ImageBackground
      source={require("../../../assets/images/auth-page-images/sign-in-image.jpg")}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Gradient makes the photo readable regardless of what's in it */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.92)"]}
        locations={[0, 0.55, 1]}
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        {/* Spacer pushes everything below to the bottom third */}
        <View className="flex-1" />

        <View className="gap-6 px-6 pb-4">
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
            By continuing, you agree to our {""}
            <Text
              className="font-semibold text-white underline"
              onPress={() => ""}
            >
              Terms of Service
            </Text>
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
