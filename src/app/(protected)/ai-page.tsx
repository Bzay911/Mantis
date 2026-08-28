import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { File } from "expo-file-system";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../contexts/auth-context";
import { useCapturedUserImageStore } from "../../../store/captured-user-image";
import { useGeneratedImageStore } from "../../../store/generated-image-store";
import { useSelectedCutStore } from "../../../store/use-selected-cut";
import { convertImageToJpeg } from "../../../utils/convert-image-to-jpeg";
import fetchHaircuts from "../../../utils/fetch-haircuts";
import { API_BASE_URL } from "../../constants/api-config";

type SheetTarget = "user" | "inspiration";
type SheetView = "options" | "haircuts";

type Haircut = {
  id: string;
  hairType: "Short" | "Medium" | "Long";
  cutName: string;
  imageUrl: string | null;
};

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
  const [sheetView, setSheetView] = useState<SheetView>("options");

  const setGeneratedImage = useGeneratedImageStore(
    (state) => state.setGeneratedImage,
  );
  const clearGeneratedImage = useGeneratedImageStore(
    (state) => state.clearGeneratedImage,
  );

  const selectedCut = useSelectedCutStore((s) => s.selectedCut) ?? "";
  const clearSelectedCut = useSelectedCutStore((s) => s.clearSelectedCut);

  const capturedUserImage = useCapturedUserImageStore(
    (s) => s.capturedUserImage,
  );
  const clearCapturedUserImage = useCapturedUserImageStore(
    (s) => s.clearCapturedUserImage,
  );

  const [isLoading, setIsLoading] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%", "90%"], []);

  const canGenerate = Boolean(userImageUri && inspirationImageUri);

  const {
    data: haircuts = [],
    isLoading: isHaircutsLoading,
    isError: isHaircutsError,
  } = useQuery({
    queryKey: ["haircuts"],
    queryFn: fetchHaircuts,
  });

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
    bottomSheetRef.current?.close();
    setSheetView("options");

    if (!result.canceled) {
      if (sheetTarget === "user") {
        setUserImageUri(result.assets[0].uri);
      } else {
        setInspirationImageUri(result.assets[0].uri);
      }
    }
  };

  const handleSnapPress = useCallback((index: number, target: SheetTarget) => {
    Keyboard.dismiss();
    setSheetTarget(target);
    setSheetView("options");
    bottomSheetRef.current?.snapToIndex(index);
  }, []);

  const openHaircutsPicker = useCallback(() => {
    Keyboard.dismiss();
    setSheetView("haircuts");
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setSheetView("options");
  }, []);

  const handleSelectHaircut = useCallback((haircut: Haircut) => {
    if (!haircut.imageUrl) return;
    setInspirationImageUri(haircut.imageUrl);
    bottomSheetRef.current?.close();
    setSheetView("options");
  }, []);

  const handleGenerate = () => {
    clearGeneratedImage();
    setIsLoading(true);

    uploadImages(userImageUri!, inspirationImageUri!)
      .then((response) => {
        setUserImageUri(null);
        setInspirationImageUri(null);
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
          Alert.alert("Something's missing", error.message);
          return;
        }

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
    console.log("Building file from URI:", uri);
    if (!uri) return null;
    return new File(uri);
  };

  const uploadImages = async (
    uri1: string,
    uri2: string,
  ) => {
    const convertedUri1 = await convertImageToJpeg(uri1);
    const userImage = buildFile(convertedUri1);

    if (!userImage) {
      throw new Error("User image is required");
    }

    const formData = new FormData();
    formData.append("userImage", userImage, userImage.name);

    const isRemoteUrl = /^https?:\/\//i.test(uri2);

    if (isRemoteUrl) {
      formData.append("inspirationImageUrl", uri2);
    } else {
      const convertedUri2 = await convertImageToJpeg(uri2);
      const inspirationImage = buildFile(convertedUri2);
      if (!inspirationImage) {
        throw new Error("Inspiration image is required");
      }
      formData.append(
        "inspirationImage",
        inspirationImage,
        inspirationImage.name,
      );
    }

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
        <Text className="text-4xl font-fraunces-semibold text-white">
          Mantis AI
        </Text>
        <Pressable
          onPress={() => router.push("/(protected)/get-credits")}
          style={{ backgroundColor: "#9DC228" }}
          className="items-center justify-center rounded-full px-4 py-3"
        >
          <Text className="text-black text-lg font-jakarta-semibold">
            Get Credits
          </Text>
        </Pressable>
      </View>

      {/* Main content area: loading, generated result, or image picker */}
      <View className="flex-1 px-4">
        {isLoading ? (
          <View className="flex-1 items-center justify-center gap-4">
            <ActivityIndicator size="large" color="#9DC228" />
            <Text className="text-white text-lg font-jakarta">
              Generating your cut...
            </Text>
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
                <Text className="text-gray-500 text-center font-jakarta">
                  Add an inspiration image to help the AI understand the style
                  you want for your cut. Press the plus button to select an
                  inspiration image.
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Generate button */}
      <Pressable
        disabled={!canGenerate || isLoading}
        onPress={() => handleGenerate()}
        className={`mx-4 mb-4 flex-row items-center justify-center gap-2 rounded-full px-6 py-4 ${canGenerate ? "bg-[#9DC228]" : "bg-[#2c2c2e]"}`}
      >
        <Ionicons
          name="sparkles"
          size={18}
          color={canGenerate ? "black" : "#6b6b6b"}
        />
        <Text
          className={`text-lg font-jakarta-semibold ${canGenerate ? "text-black" : "text-[#6b6b6b]"}`}
        >
          Generate
        </Text>
      </Pressable>

      {/* Bottom sheet: options view or haircuts browser view */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        enableDynamicSizing={false}
        onClose={() => setSheetView("options")}
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
        {sheetView === "options" ? (
          <BottomSheetView className="flex-1 px-4 pt-2 gap-4">
            <View className="flex-row items-center justify-between w-full">
              <View style={{ width: 28 }} />
              <Text className="text-lg font-jakarta-semibold text-white">
                {sheetTarget === "user"
                  ? "Pick your image"
                  : "Pick your inspiration image"}
              </Text>
              <Pressable onPress={closeSheet}>
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
                <Text className="text-white text-base font-jakarta">
                  Capture an image from camera
                </Text>
              </Pressable>
            ) : (
              <Pressable
                className="bg-[#2c2c2e] rounded-2xl px-4 py-4 flex-row items-center gap-3"
                onPress={openHaircutsPicker}
              >
                <Ionicons name="images-outline" size={22} color="#9DC228" />
                <Text className="text-white text-base font-jakarta">
                  Pick inspiration from app
                </Text>
              </Pressable>
            )}

            <Pressable
              className="bg-[#2c2c2e] rounded-2xl px-4 py-4 flex-row items-center gap-3"
              onPress={pickImageFromGallery}
            >
              <Ionicons name="folder-outline" size={22} color="#9DC228" />
              <Text className="text-white text-base font-jakarta">
                Pick inspiration from gallery
              </Text>
            </Pressable>
          </BottomSheetView>
        ) : (
          <View className="flex-1 px-4 pt-2">
            <View className="flex-row items-center justify-between w-full mb-4">
              <Pressable onPress={() => handleSnapPress(0, "inspiration")}>
                <Ionicons name="chevron-back" size={26} color="white" />
              </Pressable>
              <Text className="text-lg font-jakarta-semibold text-white">
                Choose a haircut
              </Text>
              <Pressable onPress={closeSheet}>
                <Ionicons name="chevron-down" size={28} color="white" />
              </Pressable>
            </View>

            {isHaircutsLoading ? (
              <View className="flex-1 items-center justify-center gap-3 pb-20">
                <ActivityIndicator size="large" color="#9DC228" />
                <Text className="text-white font-jakarta">
                  Loading haircuts...
                </Text>
              </View>
            ) : isHaircutsError ? (
              <View className="flex-1 items-center justify-center pb-20">
                <Text className="text-white font-jakarta">
                  Couldn't load haircuts. Try again later.
                </Text>
              </View>
            ) : (
              <BottomSheetFlatList
                data={haircuts}
                keyExtractor={(item: Haircut) => item.id}
                contentContainerStyle={{ paddingBottom: 32 }}
                renderItem={({ item }: { item: Haircut }) => (
                  <Pressable
                    onPress={() => handleSelectHaircut(item)}
                    className="flex-row items-center gap-3 py-2 px-2 rounded-xl mb-2 bg-[#2c2c2e]"
                  >
                    <Image
                      source={
                        item.imageUrl
                          ? { uri: item.imageUrl }
                          : require("../../../assets/images/app-images/placeholder-image.jpeg")
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
          </View>
        )}
      </BottomSheet>
    </SafeAreaView>
  );
}
