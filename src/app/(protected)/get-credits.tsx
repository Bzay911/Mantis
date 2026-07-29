import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const BRAND = "#9DC228";

const PACKS = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 10,
    price: "$2.99",
    tagline: "Dip your toes in. Try a few looks on for size.",
    popular: false,
  },
  {
    id: "popular",
    name: "Popular Pack",
    credits: 30,
    price: "$6.99",
    tagline: "Our fan favorite. Enough tries to actually find your look.",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro Pack",
    credits: 75,
    price: "$14.99",
    tagline: "Go all in. Explore every style you've been curious about.",
    popular: false,
  },
];

export default function GetCredits() {
  const router = useRouter();
  const [selected, setSelected] = useState("popular");

  return (
    <SafeAreaView className="flex-1 bg-[#1c1c1e] p-2">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
        <Text className="text-3xl font-bold text-white">Get Credits</Text>
        <Ionicons
          name="close"
          size={28}
          color="white"
          onPress={() => router.back()}
          />
      </View>

      {/* Subheadline */}
      <View className="px-6 mb-4">
        <Text className="text-base text-gray-400">
          Your next cut is just a credit away.
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {PACKS.map((pack) => {
          const isSelected = selected === pack.id;
          return (
            <Pressable
              key={pack.id}
              onPress={() => setSelected(pack.id)}
              className="mb-4 rounded-2xl p-5"
              style={{
                backgroundColor: "#2c2c2e",
                borderWidth: 2,
                borderColor: isSelected ? BRAND : "transparent",
              }}
            >
              {pack.popular && (
                <View
                  className="absolute -top-3 right-5 px-3 py-1 rounded-full"
                  style={{ backgroundColor: BRAND }}
                >
                  <Text className="text-xs font-bold text-black">
                    MOST POPULAR
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-3">
                  <Text className="text-white text-lg font-bold mb-1">
                    {pack.name}
                  </Text>
                  <Text
                    className="text-2xl font-extrabold mb-2"
                    style={{ color: BRAND }}
                  >
                    {pack.credits} Generations
                  </Text>
                  <Text className="text-gray-400 text-sm leading-5">
                    {pack.tagline}
                  </Text>
                </View>

                <View className="items-end">
                  <Text className="text-white text-xl font-bold">
                    {pack.price}
                  </Text>
                  <View
                    className="w-6 h-6 rounded-full mt-3 items-center justify-center"
                    style={{
                      borderWidth: 2,
                      borderColor: isSelected ? BRAND : "#555",
                      backgroundColor: isSelected ? BRAND : "transparent",
                    }}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="black" />
                    )}
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* CTA */}
      <View className="px-6 pb-6 pt-2">
        <Pressable
          className="rounded-2xl py-4 items-center"
          style={{ backgroundColor: BRAND }}
          onPress={() => {
            // handle purchase for `selected`
          }}
        >
          <Text className="text-black text-lg font-bold">
            Get Credits
          </Text>
        </Pressable>
        <Text className="text-gray-500 text-xs text-center mt-3">
          Credits never expire. Use them whenever inspiration strikes.
        </Text>
      </View>
    </SafeAreaView>
  );
}
// import { View } from "react-native";
// import RevenueCatUI from "react-native-purchases-ui";
// import { useRouter } from "expo-router";

// export default function GetCredits() {
//   const router = useRouter();

//   return (
//     <View style={{ flex: 1 }}>
//       <RevenueCatUI.Paywall
//         onDismiss={() => {
//           router.back();
//         }}
//       />
//     </View>
//   );
// }