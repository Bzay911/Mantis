// components/onboarding/onboarding-header.tsx
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export function OnboardingHeader({ step, totalSteps = 4 }: { step: number; totalSteps?: number }) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Ionicons
          name="chevron-back"
          size={26}
          color={step === 1 ? "transparent" : "white"}
        />
      </Pressable>
      <View className="flex-row gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            className={`h-1.5 rounded-full ${
              i < step ? "bg-[#9DC228] w-6" : "bg-[#2c2c2e] w-4"
            }`}
          />
        ))}
      </View>
      <View style={{ width: 26 }} />
    </View>
  );
}