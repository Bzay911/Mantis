import { Pressable, Text, View, useWindowDimensions, Alert } from "react-native";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGeneratedImageStore } from "../../../store/generated-image-store";
import {
  ResumableZoom,
  useImageResolution,
  fitContainer,
} from "react-native-zoom-toolkit";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import * as Sharing from "expo-sharing";
import { Directory, File, Paths } from "expo-file-system";

export default function GeneratedImageDisplayer() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const { imageUrl: paramImageUrl } = useLocalSearchParams<{
    imageUrl?: string;
  }>();

  const generatedImage = useGeneratedImageStore(
    (state) => state.generatedImage,
  );
  const clearGeneratedImage = useGeneratedImageStore(
    (state) => state.clearGeneratedImage,
  );

  // Prefer whatever was passed via route params; fall back to the store
  const displayImage = paramImageUrl || generatedImage;

  const { isFetching, resolution } = useImageResolution({
    uri: displayImage || "",
  });

  const [isSharing, setIsSharing] = useState(false);  

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ["haircuts"] });
    };
  }, [queryClient]);

  if (isFetching || resolution === undefined) {
    return null;
  }

  const size = fitContainer(resolution.width / resolution.height, {
    width,
    height,
  });

  const handleShare = async () => {
    if (!displayImage) return;

    setIsSharing(true);
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Sharing isn't available on this device");
        return;
      }

      // Download the remote image into a local cache directory first —
      // Sharing needs an on-device file, not a remote URL.
      const cacheDir = new Directory(Paths.cache, "shared-haircuts");
      if (!cacheDir.exists) {
         cacheDir.create();
      }

      // we are downloading the image to a local file to ensure that it can be shared properly, 
      // as some sharing targets may not handle remote URLs well.
      const downloaded = await File.downloadFileAsync(displayImage, cacheDir, {idempotent: true});

      await Sharing.shareAsync(downloaded.uri, {
        mimeType: "image/jpeg",
        dialogTitle: "Share your haircut",
      });
    } catch (error) {
      console.error("Share failed:", error);
      Alert.alert("Couldn't share image", "Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

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
        <Text className="text-2xl font-fraunces-semibold text-white">
          Generated Image
        </Text>
      
          <Pressable
            style={{ backgroundColor: "#9DC228" }}
            className="flex-row items-center rounded-full px-4 py-3 gap-2"
            onPress={handleShare}
            disabled={isSharing}
          >
              <Ionicons name="share-outline" size={22} color="black" />
            <Text className="text-black text-lg font-jakarta-semibold">
              {isSharing ? "Sharing..." : "Share"}
            </Text>
          </Pressable>
      </View>

      {displayImage && (
        <View className="flex-1">
          <ResumableZoom maxScale={resolution}>
            <Image
              source={{ uri: displayImage }}
              style={{ ...size }}
              contentFit="contain"
            />
          </ResumableZoom>
        </View>
      )}
    </SafeAreaView>
  );
}