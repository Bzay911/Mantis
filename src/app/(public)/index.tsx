// app/(onboarding)/welcome.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingHeader } from "../../../components/onboarding/onboarding-header";

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-black">

      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-10">
          <View className="flex-row items-center gap-3">
            <View className="w-24 h-24 rounded-2xl bg-[#2c2c2e] items-center justify-center">
              <Ionicons name="person-outline" size={32} color="#9DC228" />
            </View>
            <Ionicons name="add" size={24} color="#6b6b6b" />
            <View className="w-24 h-24 rounded-2xl bg-[#2c2c2e] items-center justify-center">
              <Ionicons name="cut-outline" size={32} color="#9DC228" />
            </View>
          </View>
          <Ionicons
            name="arrow-down"
            size={22}
            color="#6b6b6b"
            style={{ marginVertical: 16 }}
          />
          <View className="w-24 h-24 rounded-full bg-[#9DC228] items-center justify-center">
            <Ionicons name="sparkles" size={30} color="black" />
          </View>
        </View>

        <Text className="text-4xl font-fraunces-semibold text-white text-center mb-3">
          Two images.{"\n"}One new look.
        </Text>
        <Text className="text-gray-400 text-center font-jakarta text-base leading-6">
          Mantis uses your photo and a hairstyle you're inspired by to create
          your new look.
        </Text>
      </View>

      <View className="px-4 pb-6">
        <Pressable
            onPress={() => router.push("/(public)/(onboarding)/user-image-picker")}
          style={{ backgroundColor: "#9DC228" }}
          className="items-center justify-center rounded-full py-4"
        >
          <Text className="text-black text-lg font-jakarta-semibold">
            Continue
          </Text>
        </Pressable>
      </View>
      <OnboardingHeader step={1} />

    </SafeAreaView>
  );
}
