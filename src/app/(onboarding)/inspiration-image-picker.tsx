import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingHeader } from "../../../components/onboarding/onboarding-header";
import { useOnboardingStore } from "../../../store/onboarding-store";
import { useSelectedCutStore } from "../../../store/use-selected-cut";
import type { Haircut } from "../../../types/haircut";
import fetchHaircuts from "../../../utils/fetch-haircuts";
import { pickImageFromGallery } from "../../../utils/pick-image-from-gallery";

const SURFACE = "#131315";
const SURFACE_RAISED = "#1C1C1E";

export default function InspirationImagePicker() {
  const router = useRouter();
  const [inspirationUri, setInspirationUri] = useState<string | null>(null);
  const setSelectedCut = useSelectedCutStore((s) => s.setSelectedCut);
  const setPendingGeneration = useOnboardingStore(
    (s) => s.setPendingGeneration,
  );

  const { data: haircuts = [], isLoading } = useQuery({
    queryKey: ["haircuts"],
    queryFn: fetchHaircuts,
  });

  const handlePickFromGallery = async () => {
    const uri = await pickImageFromGallery();
    if (uri) {
      setInspirationUri(uri);
    }
  };

  const handleContinue = () => {
    if (!inspirationUri) return;
    setSelectedCut(inspirationUri);
    setPendingGeneration(true);
    router.push("/login-screen");
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 px-6 pt-4">
        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="w-12 h-12 rounded-full items-center justify-center active:opacity-70"
          style={{ backgroundColor: SURFACE_RAISED }}
        >
          <Ionicons name="chevron-back" size={22} color="white" />
        </Pressable>

        <Text className="text-3xl font-fraunces-semibold text-white mt-4 mb-2">
          Now, show us the look.
        </Text>
        <Text className="text-gray-400 font-jakarta mb-6">
          Choose a hairstyle you want to try.
        </Text>

        {inspirationUri ? (
          <View
            className="flex-1 rounded-[32px] overflow-hidden mb-6"
            style={{ backgroundColor: SURFACE }}
          >
            <Image
              source={{ uri: inspirationUri }}
              contentFit="cover"
              transition={200}
              style={{ width: "100%", height: "100%" }}
            />

            {/* Clear selected look */}
            <Pressable
              onPress={() => setInspirationUri(null)}
              hitSlop={8}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="white" />
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable
              className="bg-[#2c2c2e] rounded-2xl px-4 py-4 flex-row items-center gap-3 mb-4"
              onPress={handlePickFromGallery}
            >
              <Ionicons name="folder-outline" size={22} color="#9DC228" />
              <Text className="text-white text-base font-jakarta">
                Pick from Library
              </Text>
            </Pressable>

            <Text className="text-white font-jakarta-semibold mb-3">
              Or pick from our styles
            </Text>

            {isLoading ? (
              <ActivityIndicator color="#9DC228" />
            ) : (
              <FlatList
                data={haircuts}
                keyExtractor={(item: Haircut) => item.id}
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }: { item: Haircut }) => (
                  <Pressable
                    onPress={() =>
                      item.imageUrl && setInspirationUri(item.imageUrl)
                    }
                    className="flex-row items-center gap-3 py-2 px-2 rounded-xl mb-2 bg-[#2c2c2e]"
                  >
                    <Image
                      source={
                        item.imageUrl
                          ? { uri: item.imageUrl }
                          : require("../../../assets/images/app-images/user-placeholder.png")
                      }
                      contentFit="cover"
                      style={{ width: 56, height: 56, borderRadius: 10 }}
                    />
                    <View className="flex-1">
                      <Text className="text-white text-base font-jakarta-semibold">
                        {item.cutName}
                      </Text>
                      <Text className="text-gray-500 text-sm font-jakarta">
                        {item.hairType} hair
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#6b6b6b"
                    />
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text className="text-center text-zinc-500 mt-10 font-jakarta">
                    No haircuts found.
                  </Text>
                }
              />
            )}
          </>
        )}
      </View>

      <View className="px-4 pb-6">
        <Pressable
          disabled={!inspirationUri}
          onPress={handleContinue}
          className={`flex-row items-center justify-center gap-2 rounded-full py-4 ${
            inspirationUri ? "bg-[#9DC228]" : "bg-[#2c2c2e]"
          }`}
        >
          <Ionicons
            name="sparkles"
            size={20}
            color={inspirationUri ? "black" : "#6b6b6b"}
          />
          <Text
            className={`text-lg font-jakarta-semibold ${
              inspirationUri ? "text-black" : "text-[#6b6b6b]"
            }`}
          >
            Generate my look
          </Text>
        </Pressable>
      </View>

      <OnboardingHeader step={3} />
    </SafeAreaView>
  );
}
