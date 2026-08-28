import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGeneratedImageStore } from "../../../store/generated-image-store";
import {
  ResumableZoom,
  useImageResolution,
  fitContainer,
} from "react-native-zoom-toolkit";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GeneratedImageDisplayer() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const generatedImage = useGeneratedImageStore(
    (state) => state.generatedImage,
  );
  const { isFetching, resolution } = useImageResolution({
    uri: generatedImage || "",
  });

  const clearGeneratedImage = useGeneratedImageStore(
    (state) => state.clearGeneratedImage,
  );

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
      <View className="flex-row items-center justify-between px-4">
        <Ionicons
          name="close"
          size={28}
          color="white"
          onPress={() => {
            clearGeneratedImage();
            router.back();
          }}
        />
        <Text className="text-2xl font-fraunces-semibold text-white">Generated Image</Text>
        <View className="flex-row items-center justify-center gap-4">
          <Pressable>
            <Ionicons name="share-outline" size={28} color="white" />
          </Pressable>
          <Pressable
            style={{ backgroundColor: "#9DC228" }}
            className="items-center justify-center rounded-full px-4 py-3"
          >
            <Text className="text-black text-lg font-jakarta-semibold">Save</Text>
          </Pressable>
        </View>
      </View>

      {generatedImage && (
        <View className="flex-1">
          <ResumableZoom maxScale={resolution}>
            <Image
              source={{ uri: generatedImage }}
              style={{ ...size }}
              contentFit="contain"
            />
          </ResumableZoom>
        </View>
      )}
    </SafeAreaView>
  );
}
