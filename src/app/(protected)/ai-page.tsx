import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  TextInput,
  ScrollView,
  Keyboard,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useGeneratedImageStore } from "../../../store/generated-image-store";
import { useCapturedUserImageStore } from "../../../store/captured-user-image";
import { useSelectedCutStore } from "../../../store/use-selected-cut";
import { API_BASE_URL } from "../../constants/api-config";
import { convertImageToJpeg } from "../../../utils/convert-image-to-jpeg";
import { useAuth } from "../../../contexts/auth-context";

type SheetTarget = "user" | "inspiration";

export default function AiPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  const [userImageUri, setUserImageUri] = useState<string | null>(
    imageUri || null,
  );
  const [inspirationImageUri, setInspirationImageUri] = useState<string | null>(
    null,
  );
  const [sheetTarget, setSheetTarget] = useState<SheetTarget>("inspiration");

  const setGeneratedImage = useGeneratedImageStore((state) => state.setGeneratedImage);
  const clearGeneratedImage = useGeneratedImageStore((state) => state.clearGeneratedImage);

  const selectedCut = useSelectedCutStore((s) => s.selectedCut) ?? "";
  const clearSelectedCut = useSelectedCutStore((s) => s.clearSelectedCut);

  const capturedUserImage = useCapturedUserImageStore((s) => s.capturedUserImage);
  const clearCapturedUserImage = useCapturedUserImageStore((s) => s.clearCapturedUserImage);

  const [promptText, setPromptText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const inputRef = useRef<TextInput>(null);
  const snapPoints = useMemo(() => ["30%"], []);
  const offSet = { closed: -40, opened: -10 };

  const hasText = promptText.trim().length > 0;

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }, []),
  );

  useEffect(() => {
    if (selectedCut) {
      setInspirationImageUri(selectedCut);

      clearSelectedCut();
    }
  }, [selectedCut, clearSelectedCut]);

  useEffect(() => {
  if (capturedUserImage) {
    setUserImageUri(capturedUserImage);
    clearCapturedUserImage();
  }
}, [capturedUserImage, clearCapturedUserImage]);

  const pickImageFromGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the gallery is required!",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    console.log(result);
    bottomSheetRef.current?.close();
    inputRef.current?.focus();

    if (!result.canceled) {
      if (sheetTarget === "user") {
        setUserImageUri(result.assets[0].uri);
      } else {
        setInspirationImageUri(result.assets[0].uri);
      }
    }
  };

  const handleSnapPress = useCallback((index: number, target: SheetTarget) => {
    console.log("Opening bottom sheet");
    Keyboard.dismiss();
    setSheetTarget(target);
    bottomSheetRef.current?.snapToIndex(index);
  }, []);

  const handlePromptSend = (prompt: string) => {
    setPromptText("");
    Keyboard.dismiss();
    inputRef.current?.blur();

    clearGeneratedImage();
    setIsLoading(true);

    uploadImages(userImageUri!, inspirationImageUri!, prompt)
      .then((response) => {
        setGeneratedImage(response.generatedImage);
        router.push("/(protected)/generated-image-displayer");
      })
      .catch((error: Error & { status?: number }) => {
        console.error("Upload failed:", error);

        if (error.status === 402) {
          Alert.alert(
            "Not enough credits",
            "You don't have enough credits to generate an image. Please get more credits.",
          );
          router.push("/(protected)/get-credits");
          return;
        }

        if (error.status === 400) {
          // Bad request — e.g. missing images/prompt caught server-side too
          Alert.alert("Something's missing", error.message);
          return;
        }

        // Generic fallback — 500s, network errors, etc.
        Alert.alert(
          "Upload failed",
          "There was an error uploading the images. Please try again.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const buildFile = (uri: string): File | null => {
    if (!uri) return null;
    return new File(uri);
  };

  const uploadImages = async (
    uri1: string,
    uri2: string,
    userPrompt: string,
  ) => {
    const convertedUri1 = await convertImageToJpeg(uri1);
    const convertedUri2 = await convertImageToJpeg(uri2);
    const userImage = buildFile(convertedUri1);
    const inspirationImage = buildFile(convertedUri2);

    if (!userImage || !inspirationImage) {
      throw new Error("Both images are required");
    }

    const formData = new FormData();
    formData.append("userImage", userImage, userImage.name);
    formData.append(
      "inspirationImage",
      inspirationImage,
      inspirationImage.name,
    );
    formData.append("userPrompt", userPrompt);

    const response = await fetch(`${API_BASE_URL}/api/images/upload-images`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || "Upload failed") as Error & {
        status?: number;
      };
      error.status = response.status;
      throw error;
    }

    return data;
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-6 justify-between px-4">
        <Ionicons
          name="chevron-back"
          size={28}
          color="white"
          onPress={() => router.back()}
        />
        <Text className="text-4xl font-bold text-white">Mantis AI</Text>
        <Pressable
          onPress={() => router.push("/(protected)/get-credits")}
          style={{ backgroundColor: "#9DC228" }}
          className="items-center justify-center rounded-full px-4 py-3"
        >
          <Text className="text-black text-lg font-bold">Get Credits</Text>
        </Pressable>
      </View>

      {/* Main content area: loading, generated result, or image picker */}
      <View className="flex-1 px-4">
        {isLoading ? (
          <View className="flex-1 items-center justify-center gap-4">
            <ActivityIndicator size="large" color="#9DC228" />
            <Text className="text-white text-lg">Generating your cut...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "space-between",
            }}
            keyboardShouldPersistTaps="handled"
            className="flex-1"
          >
            <View>
              <View className="flex-row items-center justify-center gap-2">
                <Pressable
                  className="w-[130px] h-[130px] bg-white rounded-full items-center justify-center"
                  onPress={() => handleSnapPress(0, "user")}
                >
                  <View className="w-[128px] h-[128px] bg-black rounded-full items-center justify-center">
                    {userImageUri ? (
                      <Image
                        source={{ uri: userImageUri }}
                        contentFit="cover"
                        style={{ width: 128, height: 128, borderRadius: 65 }}
                      />
                    ) : (
                      <Ionicons name="add" size={50} color="gray" />
                    )}
                  </View>
                </Pressable>

                <Pressable
                  className="w-[130px] h-[130px] bg-white rounded-full items-center justify-center"
                  onPress={() => handleSnapPress(0, "inspiration")}
                >
                  <View className="w-[128px] h-[128px] bg-black rounded-full items-center justify-center">
                    {inspirationImageUri ? (
                      <Image
                        source={{ uri: inspirationImageUri }}
                        contentFit="cover"
                        style={{ width: 128, height: 128, borderRadius: 65 }}
                      />
                    ) : (
                      <Ionicons name="add" size={50} color="gray" />
                    )}
                  </View>
                </Pressable>
              </View>

              <View className="mt-6">
                <Text className="text-gray-500 text-center">
                  Add an inspiration image to help the AI understand the style
                  you want for your cut. Press the plus button to select an
                  inspiration image.
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Prompt input bar */}
      <KeyboardStickyView
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
        offset={offSet}
      >
        <Pressable
          className="bg-[#2c2c2e] rounded-full p-2 items-center justify-center"
          // onPress={() => handleSnapPress(0)}
        >
          <Ionicons name="add" size={28} color="white" />
        </Pressable>

        <TextInput
          ref={inputRef}
          value={promptText}
          onChangeText={setPromptText}
          placeholder="Describe your change..."
          placeholderTextColor="#8e8e93"
          keyboardAppearance="dark"
          className="flex-1 rounded-xl border border-[#2c2c2e] bg-[#1c1c1e] px-4 py-4 text-white"
        />

        <Pressable
          onPress={() => handlePromptSend(promptText)}
          className={`${hasText ? "bg-[#9DC228]" : "bg-[#2c2c2e]"} rounded-full p-2 items-center justify-center`}
        >
          <Ionicons
            name="arrow-up"
            size={28}
            color={hasText ? "black" : "gray"}
          />
        </Pressable>
      </KeyboardStickyView>

      {/* Inspiration image picker bottom sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: "#1c1c1e" }}
        handleIndicatorStyle={{ backgroundColor: "#6b6b6b", width: 40 }}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <BottomSheetView className="flex-1 px-4 pt-2 gap-4">
          <View className="flex-row items-center justify-between w-full">
            <View style={{ width: 28 }} />
            <Text className="text-lg font-bold text-white">
              {sheetTarget === "user"
                ? "Pick your image"
                : "Pick your inspiration image"}
            </Text>
            <Pressable onPress={() => bottomSheetRef.current?.close()}>
              <Ionicons name="chevron-down" size={28} color="white" />
            </Pressable>
          </View>

          {sheetTarget === "user" ? (
            <Pressable
              className="bg-[#2c2c2e] rounded-2xl px-4 py-4 flex-row items-center gap-3"
              onPress={() => {
                router.push("/(protected)/camera-capture-screen");
              }}
            >
              <Ionicons name="camera-outline" size={22} color="#9DC228" />
              <Text className="text-white text-base">
                Capture an image from camera
              </Text>
            </Pressable>
          ) : (
            <Pressable
              className="bg-[#2c2c2e] rounded-2xl px-4 py-4 flex-row items-center gap-3"
              onPress={() => {
                // pick from app
              }}
            >
              <Ionicons name="images-outline" size={22} color="#9DC228" />
              <Text className="text-white text-base">
                Pick inspiration from app
              </Text>
            </Pressable>
          )}

          <Pressable
            className="bg-[#2c2c2e] rounded-2xl px-4 py-4 flex-row items-center gap-3"
            onPress={() => {
              pickImageFromGallery();
            }}
          >
            <Ionicons name="folder-outline" size={22} color="#9DC228" />
            <Text className="text-white text-base">
              Pick inspiration from gallery
            </Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}
