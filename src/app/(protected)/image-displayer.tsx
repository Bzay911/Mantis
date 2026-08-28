import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ResumableZoom,
  useImageResolution,
  fitContainer,
} from "react-native-zoom-toolkit";
import { useSelectedCutStore } from "../../../store/use-selected-cut";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ImageDisplayer() {
  const router = useRouter();
  const setSelectedCut = useSelectedCutStore((s) => s.setSelectedCut);
  const { imageUrl, cutName } = useLocalSearchParams() as {
    imageUrl: string;
    cutName: string;
  };

  const { width, height } = useWindowDimensions();
  const { isFetching, resolution } = useImageResolution({ uri: imageUrl });

  if (isFetching || resolution === undefined) {
    return null;
  }

  const size = fitContainer(resolution.width / resolution.height, {
    width,
    height,
  });

  return (
    <SafeAreaView className="flex-1 bg-[#1c1c1e] p-4">
      {/* Header */}
      <View className="flex-row items-center mb-6 justify-between px-4">
        <Ionicons
          name="close"
          size={28}
          color="white"
          onPress={() => {
            router.back();
          }}
        />
        <Text className="text-3xl font-fraunces-semibold text-white">{cutName}</Text>
        <Pressable
          style={{ backgroundColor: "#9DC228" }}
          className="items-center justify-center rounded-full px-4 py-3"
          onPress={() => {
            setSelectedCut(imageUrl);
            router.replace("/(protected)/ai-page");
          }}
        >
          <Text className="text-black text-lg font-jakarta-semibold">Use Image</Text>
        </Pressable>
      </View>

      {imageUrl && (
        <View className="flex-1">
          <ResumableZoom maxScale={resolution}>
            <Image
              source={{ uri: imageUrl }}
              style={{ ...size }}
              contentFit="contain"
            />
          </ResumableZoom>
        </View>
      )}
    </SafeAreaView>
  );
}
