import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../../contexts/auth-context";
import { useRouter } from "expo-router";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-black p-4">
      <Text className="text-4xl font-bold text-white">Profile</Text>

      <Text className="text-white mt-6 mb-3 mx-2 text-xl font-semibold">
        Account Details
      </Text>
      <View className="justify-center items-center bg-[#27272a] p-6 rounded-[28px]">
        <View className="flex-row justify-between w-full border-b-[0.5px] border-gray-500 pb-3">
          <Text className="text-white text-lg">Full Name</Text>
          <Text className="text-white text-lg">{user?.displayName}</Text>
        </View>
        <View className="flex-row justify-between w-full border-b-[0.5px] border-gray-500 pb-3 mt-4">
          <Text className="text-white text-lg">Email</Text>
          <Text className="text-white text-lg">{user?.email}</Text>
        </View>
        <View className="flex-row justify-between w-full mt-4">
          <Text className="text-white text-lg">Joined At</Text>
          <Text className="text-white text-lg">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "N/A"}
          </Text>
        </View>
      </View>

      <Text className="text-white mt-6 mb-3 mx-2 text-xl font-semibold">
        Credits
      </Text>
      <View className="justify-center items-center bg-[#27272a] p-6 rounded-[28px]">
        <View className="flex-row justify-between w-full border-b-[0.5px] border-gray-500 pb-3">
          <Text className="text-white text-lg">Current Credits</Text>
          <Text className="text-[#9DC228] font-semibold text-xl">
            {user?.credits || 0} credits
          </Text>
        </View>
        <View className="flex-row items-center gap-2 justify-center w-full mt-4">
          <Ionicons name="flash" size={24} color="#9DC228" />
          <Pressable onPress={() => router.push("/(protected)/get-credits")}>
          <Text className="text-[#9DC228] font-semibold text-xl">
            Add more credits
          </Text>
          </Pressable>
        </View>
      </View>
          <Text className="text-gray-500 mx-4 my-2">Each credit lets you create one AI-generated image. {user?.credits || 0} credits means {user?.credits || 0} image generations.</Text>

      <Pressable
        className="flex-row gap-4 items-center bg-[#27272a] py-4 px-6 rounded-[28px] mt-6 active:opacity-80"
        onPress={() => {
          logout();
        }}
      >
        <Ionicons name="log-out-outline" size={28} color="#f87171" />
        <Text className="text-[#f87171] font-semibold text-xl">Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
}
