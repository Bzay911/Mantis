import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingHeader } from "../../../components/onboarding/onboarding-header";
import { useCapturedUserImageStore } from "../../../store/captured-user-image";
import { pickImageFromGallery } from "../../../utils/pick-image-from-gallery";
import { CameraCapture } from "../../components/camera-capture";
import { StatusBar } from "expo-status-bar";

const LIME = "#B2C95A";
const SURFACE = "#131315";
const SURFACE_RAISED = "#1C1C1E";

const PLACEHOLDER_IMAGE = require("../../../assets/images/app-images/user-placeholder.png");

export default function UserImagePicker() {
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const setCapturedUserImage = useCapturedUserImageStore(
    (s) => s.setCapturedUserImage,
  );

  const handlePickFromGallery = async () => {
    const uri = await pickImageFromGallery();
    if (uri) {
      setPhotoUri(uri);
    }
  };

  const handleContinue = () => {
    if (!photoUri) return;
    setCapturedUserImage(photoUri);
    router.push("/inspiration-image-picker");
  };

  if (isCameraOpen) {
    return (
      <CameraCapture
        onClose={() => setIsCameraOpen(false)}
        onProceed={(uri) => {
          setPhotoUri(uri);
          setIsCameraOpen(false);
        }}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
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

        {/* Copy */}
        <Text className="text-4xl font-fraunces-semibold text-white mt-6 mb-2">
          First, the before.
        </Text>
        <Text className="text-gray-400 font-jakarta text-base mb-6">
          Face forward, hair visible, good light.
        </Text>

        {/* Photo card */}
        <View
          className="flex-1 rounded-[32px] overflow-hidden mb-6"
          style={{ backgroundColor: SURFACE }}
        >
          <Image
            source={photoUri ? { uri: photoUri } : PLACEHOLDER_IMAGE}
            contentFit="cover"
            transition={200}
            style={{ width: "100%", height: "100%" }}
          />

          {/* Clear selected photo */}
          {photoUri && (
            <Pressable
              onPress={() => setPhotoUri(null)}
              hitSlop={8}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="white" />
            </Pressable>
          )}

          {/* Camera / Library bar */}
          <View
            className="absolute left-3 right-3 bottom-3 flex-row rounded-3xl border border-white/10"
            style={{ backgroundColor: `${SURFACE_RAISED}F2` }}
          >
            <Pressable
              onPress={() => setIsCameraOpen(true)}
              className="flex-1 flex-row items-center justify-center gap-3 py-5 active:opacity-70"
            >
              <Ionicons name="camera-outline" size={22} color={LIME} />
              <Text className="text-white text-base font-jakarta-semibold">
                Camera
              </Text>
            </Pressable>

            <View className="w-px bg-white/10 my-3" />

            <Pressable
              onPress={handlePickFromGallery}
              className="flex-1 flex-row items-center justify-center gap-3 py-5 active:opacity-70"
            >
              <Ionicons name="image-outline" size={22} color={LIME} />
              <Text className="text-white text-base font-jakarta-semibold">
                Library
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Continue */}
        <Pressable
          disabled={!photoUri}
          onPress={handleContinue}
          className="h-16 items-center justify-center rounded-full mb-4 active:opacity-90"
          style={{ backgroundColor: photoUri ? LIME : SURFACE_RAISED }}
        >
          <Text
            className={`text-lg font-jakarta-semibold ${
              photoUri ? "text-black" : "text-[#5C5C5E]"
            }`}
          >
            Continue
          </Text>
        </Pressable>
      </View>

      <OnboardingHeader step={2} />
    </SafeAreaView>
  );
}
