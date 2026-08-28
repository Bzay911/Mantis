import { ImageBackground, View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyHaircuts() {
  return (
    <SafeAreaView className="flex-1 bg-black p-4">
      <Text className="text-4xl font-fraunces-semibold text-white">My Haircuts</Text>
      <View className="flex-1 justify-center items-center">
        <Ionicons name="images" size={34} color="#9DC228" />
        <View className="flex-row items-center justify-center mt-2">
          <Text className="text-xl font-jakarta-semibold text-white">
            No haircuts found !
          </Text>
        </View>
        <Text className="text-gray-400 text-center mt-2 font-jakarta">
          Tap the camera in the bottom-right corner to start creating your first
          haircut.
        </Text>
        <View className="absolute bottom-0 right-10">
          <ImageBackground
            source={require("../../../../assets/images/app-images/my-haircuts-palceholder.png")}
            className="h-80 w-80"
            resizeMode="cover"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
