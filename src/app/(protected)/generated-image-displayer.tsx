import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGeneratedImageStore } from "../../../store/generated-image-store";

export default function GeneratedImageDisplayer() {
  const router = useRouter();
  const generatedImage = useGeneratedImageStore(
    (state) => state.generatedImage,
  );
  const clearGeneratedImage = useGeneratedImageStore(
    (state) => state.clearGeneratedImage,
  );

  return (
    <View className="flex-1 bg-[#1c1c1e] p-4">
      {/* Header */}
      <View className="flex-row items-center mb-6 justify-between px-4">
        <Ionicons
          name="close"
          size={28}
          color="white"
          onPress={() => {
            clearGeneratedImage();
            router.back();
          }}
        />
        <Text className="text-4xl font-bold text-white">Nextcut AI</Text>
        <View className="flex-row items-center justify-center gap-4">
          <Pressable>
            <Ionicons name="share-outline" size={28} color="white" />
          </Pressable>
          <Pressable
            style={{ backgroundColor: "#9DC228" }}
            className="items-center justify-center rounded-full px-4 py-3"
          >
            <Text className="text-black text-lg font-bold">Save</Text>
          </Pressable>
        </View>
      </View>

      {generatedImage && (
        <View className="flex-1">
          <Image
            source={{ uri: generatedImage }}
            contentFit="cover"
            style={{ width: "100%", height: 600, borderRadius: 10 }}
          />
        </View>
      )}
    </View>
  );
}
