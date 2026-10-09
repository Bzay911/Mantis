import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { OnboardingHeader } from "../../../components/onboarding/onboarding-header";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LIME = "#B2C95A";
const HERO_IMAGE = require("../../../assets/images/auth-page-images/welcome-screen-img.png");

// Read the image's real dimensions so it always keeps its proportions
const { width: heroW, height: heroH } = Image.resolveAssetSource(HERO_IMAGE);
const HERO_ASPECT = heroW / heroH;

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: LIME }}>
      <StatusBar style="dark" />

      <View className="flex-1 px-6 pt-8">
        <Text
          className="text-black font-fraunces-semibold"
          style={{ fontSize: 50, lineHeight: 54, letterSpacing: -1 }}
        >
          Your next.{"\n"}haircut,{"\n"}previewed.
        </Text>

        <Text className="text-black/75 font-jakarta text-base leading-6 mt-4">
          Show us your face and a hairstyle you love.{"\n"}Mantis applies the hairstyle on you.
        </Text>

        {/* Hero illustration */}
        <View className="flex-1 items-center">
          <Image
            source={HERO_IMAGE}
            resizeMode="center"
            style={{ width: "100%", aspectRatio: HERO_ASPECT, maxHeight: "100%" }}
          />
        </View>
      </View>

      {/* CTA */}
      <View className="px-6 pb-4">
        <Pressable
          onPress={() => router.push("/user-image-picker")}
          className="flex-row items-center justify-between rounded-full pl-8 pr-2 h-[72px] active:opacity-90"
          style={{ backgroundColor: "#0A0A0A" }}
        >
          <Text className="text-white text-xl font-jakarta-semibold">
            Get started
          </Text>
          <View
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ backgroundColor: LIME }}
          >
            <Ionicons name="arrow-forward" size={22} color="black" />
          </View>
        </Pressable>

      </View>
        <OnboardingHeader step={1} totalSteps={4} variant="light" />
    </SafeAreaView>
  );
}