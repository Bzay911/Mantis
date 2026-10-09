import { View, Text, Button, Pressable, Alert } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Presets } from "react-native-pulsar";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  onProceed: (uri: string) => void;
  onClose: () => void;
};

export function CameraCapture({ onProceed, onClose }: Props) {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [uri, setUri] = useState<string | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-white font-jakarta">
          Camera access is required to use this feature.
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

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

    if (!result.canceled) {
      setUri(result.assets[0].uri);
    }
  };

  const toggleCameraFacing = () => {
    console.log("Toggling camera facing");
    setFacing((prevFacing) => (prevFacing === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    console.log("Taking picture");
    const photo = await cameraRef.current?.takePictureAsync();
    if (photo?.uri) {
      setUri(photo.uri);
    }
  };

  const renderPicture = (uri: string) => {
    return (
      <View>
        <Pressable
          onPress={() => setUri(null)}
          className="absolute top-4 right-6 z-10 bg-black/60 p-2 rounded-full"
        >
          <Ionicons name="close" size={28} color="white" />
        </Pressable>
        <Image
          source={{ uri }}
          contentFit="contain"
          style={{ width: "100%", aspectRatio: 2 / 3 }}
        />
        <View className="bg-black w-full h-[150px] items-center justify-around flex-row">
          <Pressable
            onPress={() => {
              Presets.System.impactMedium();
              setUri(null);
            }}
            className="bg-red-500 py-4 px-6 rounded-full flex-row items-center gap-2"
          >
            <Ionicons name="close" size={22} color="black" />
            <Text className="text-black text-xl font-jakarta">Retake</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Presets.System.impactMedium();
              onProceed(uri);
              setUri(null);
            }}
            className="bg-[#9DC228] py-4 px-6 rounded-full flex-row items-center gap-2"
          >
            <Ionicons name="checkmark" size={22} color="black" />
            <Text className="text-black text-xl font-jakarta">Proceed</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderCamera = () => {
    return (
      <View className="flex-1">
        <Pressable
          onPress={() => onClose()}
          className="absolute top-4 right-4 z-10 bg-black/60 p-2 rounded-full"
        >
          <Ionicons name="close" size={28} color="white" />
        </Pressable>

        <View className="flex-1 rounded-b-[28px] overflow-hidden">
          <CameraView
            style={{ flex: 1 }}
            facing={facing}
            ref={cameraRef}
            mirror={true}
          />

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.75)"]}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              paddingHorizontal: 24,
              paddingTop: 60,
              paddingBottom: 24,
            }}
          >
            <Text className="text-white text-2xl font-fraunces-semibold">
              Look straight ahead.
            </Text>
            <Text className="text-gray-300 text-base font-jakarta mt-1">
              Hair off your face, soft light.
            </Text>
          </LinearGradient>
        </View>
        <View className="bg-black w-full h-[120px] items-center justify-between flex-row px-6">
          <Pressable
            onPress={pickImageFromGallery}
            className="w-14 h-14 rounded-full bg-[#2c2c2e] items-center justify-center active:opacity-70"
          >
            <Ionicons name="image-outline" size={24} color="white" />
          </Pressable>

          <Pressable
            onPress={() => {
              Presets.System.impactMedium();
              takePicture();
            }}
          >
            {({ pressed }) => (
              <View className="w-20 h-20 rounded-full border-4 border-[#9DC228] bg-black items-center justify-center">
                <View
                  className="w-[62px] h-[62px] rounded-full bg-white"
                  style={{ transform: [{ scale: pressed ? 0.9 : 1 }] }}
                />
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={toggleCameraFacing}
            className="w-14 h-14 rounded-full bg-[#2c2c2e] items-center justify-center active:opacity-70"
          >
            <Ionicons name="sync" size={24} color="white" />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#000]">
      {uri ? renderPicture(uri) : renderCamera()}
    </SafeAreaView>
  );
}
