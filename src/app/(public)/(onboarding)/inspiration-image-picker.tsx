import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingHeader } from "../../../../components/onboarding/onboarding-header";
import { useSelectedCutStore } from "../../../../store/use-selected-cut";
import type { Haircut } from "../../../../types/haircut";
import fetchHaircuts from "../../../../utils/fetch-haircuts";
import { pickImageFromGallery } from "../../../../utils/pick-image-from-gallery";

export default function InspirationImagePicker() {
  const router = useRouter();
  const [inspirationUri, setInspirationUri] = useState<string | null>(null);
  const setSelectedCut = useSelectedCutStore((s) => s.setSelectedCut);

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
    router.push("/login-screen");
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <OnboardingHeader step={3} />

      <View className="flex-1 px-6">
        <Text className="text-3xl font-fraunces-semibold text-white mt-4 mb-2">
          Now, show us the look.
        </Text>
        <Text className="text-gray-400 font-jakarta mb-6">
          Choose a hairstyle you want to try.
        </Text>

        {inspirationUri ? (
          <View className="items-center mb-6">
            <Image
              source={{ uri: inspirationUri }}
              contentFit="cover"
              style={{ width: 200, height: 200, borderRadius: 20 }}
            />
            <Pressable onPress={() => setInspirationUri(null)} className="mt-3">
              <Text className="text-[#9DC228] font-jakarta-semibold">
                Choose a different look
              </Text>
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
                Upload from gallery
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
                          : require("../../../../assets/images/app-images/placeholder-image.jpeg")
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
          className={`items-center justify-center rounded-full py-4 ${
            inspirationUri ? "bg-[#9DC228]" : "bg-[#2c2c2e]"
          }`}
        >
          <Text
            className={`text-lg font-jakarta-semibold ${
              inspirationUri ? "text-black" : "text-[#6b6b6b]"
            }`}
          >
            Continue
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
