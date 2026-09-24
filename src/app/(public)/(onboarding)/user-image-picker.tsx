import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingHeader } from "../../../../components/onboarding/onboarding-header";
import { CameraCapture } from "../../../components/camera-capture";
import { pickImageFromGallery } from "../../../../utils/pick-image-from-gallery";
import { useCapturedUserImageStore } from "../../../../store/captured-user-image";
import { useRouter } from "expo-router";

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
    router.push("/(public)/(onboarding)/inspiration-image-picker");
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
      <View className="flex-1 px-6">
        <Text className="text-3xl font-fraunces-semibold text-white mt-4 mb-2">
          First, show us you.
        </Text>
        <Text className="text-gray-400 font-jakarta mb-8">
          Upload a photo you'd like to transform.
        </Text>

        {photoUri ? (
          <View className="items-center">
            <Image
              source={{ uri: photoUri }}
              contentFit="cover"
              style={{ width: 220, height: 220, borderRadius: 110 }}
            />
            <Pressable onPress={() => setPhotoUri(null)} className="mt-4">
              <Text className="text-[#9DC228] font-jakarta-semibold">
                Choose a different photo
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-3">
            <Pressable
              className="bg-[#2c2c2e] rounded-2xl px-4 py-4 flex-row items-center gap-3"
              onPress={() => setIsCameraOpen(true)}
            >
              <Ionicons name="camera-outline" size={22} color="#9DC228" />
              <Text className="text-white text-base font-jakarta">
                Take a photo
              </Text>
            </Pressable>
            <Pressable
              className="bg-[#2c2c2e] rounded-2xl px-4 py-4 flex-row items-center gap-3"
              onPress={handlePickFromGallery}
            >
              <Ionicons name="folder-outline" size={22} color="#9DC228" />
              <Text className="text-white text-base font-jakarta">
                Choose from gallery
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <View className="px-4 pb-6">
        <Pressable
          disabled={!photoUri}
          onPress={handleContinue}
          className={`items-center justify-center rounded-full py-4 ${
            photoUri ? "bg-[#9DC228]" : "bg-[#2c2c2e]"
          }`}
        >
          <Text
            className={`text-lg font-jakarta-semibold ${
              photoUri ? "text-black" : "text-[#6b6b6b]"
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