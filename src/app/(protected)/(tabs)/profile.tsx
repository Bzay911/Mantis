import { View, Text, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../../contexts/auth-context";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-black p-4">
      <Text className="text-4xl font-fraunces-semibold text-white">
        Profile
      </Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Text className="text-white mt-6 mb-3 mx-2 text-xl font-jakarta-semibold">
          Account Details
        </Text>
      
        <View className="justify-center items-center bg-[#27272a] p-6 rounded-[28px]">
          <View className="w-full">
            <View className="flex-row items-center justify-between w-full pb-3">
              <View className="flex-row items-center gap-3">
                <Ionicons name="person-outline" size={18} color="white" />
                <Text className="text-white text-lg font-jakarta">Full Name</Text>
              </View>
              <Text className="text-white text-lg font-jakarta">
                {user?.displayName}
              </Text>
            </View>
            <View className="h-[0.5px] bg-gray-500 w-[90%] self-center" />
          </View>

          <View className="w-full mt-4">
            <View className="flex-row items-center justify-between w-full pb-3">
              <View className="flex-row items-center gap-3">
                <Ionicons name="mail-outline" size={18} color="white" />
                <Text className="text-white text-lg font-jakarta">Email</Text>
              </View>
              <Text className="text-white text-lg font-jakarta">
                {user?.email}
              </Text>
            </View>
            <View className="h-[0.5px] bg-gray-500 w-[90%] self-center" />
          </View>

          <View className="flex-row items-center justify-between w-full mt-4">
            <View className="flex-row items-center gap-3">
              <Ionicons name="calendar-outline" size={18} color="white" />
              <Text className="text-white text-lg font-jakarta">Joined At</Text>
            </View>
            <Text className="text-white text-lg font-jakarta">
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

        <Text className="text-white mt-6 mb-3 mx-2 text-xl font-jakarta-semibold">
          Credits
        </Text>
        <View className="justify-center items-center bg-[#27272a] p-6 rounded-[28px]">
          <View className="w-full">
            <View className="flex-row items-center justify-between w-full pb-3">
              <View className="flex-row items-center gap-3">
                <Ionicons name="card-outline" size={18} color="white" />
                <Text className="text-white text-lg font-jakarta">
                  Current Credits
                </Text>
              </View>
              <Text className="text-[#9DC228] font-jakarta text-xl">
                {user?.credits || 0} credits
              </Text>
            </View>
            <View className="h-[0.5px] bg-gray-500 w-[90%] self-center" />
          </View>
          <View className="flex-row items-center gap-2 justify-center w-full mt-4">
            <Ionicons name="flash" size={24} color="#9DC228" />
            <Pressable onPress={() => router.push("/(protected)/get-credits")}>
              <Text className="text-[#9DC228] font-jakarta-semibold text-xl">
                Add more credits
              </Text>
            </Pressable>
          </View>
        </View>
        <Text className="text-gray-500 mx-4 my-2 font-jakarta">
          Each credit lets you create one AI-generated image.{" "}
          {user?.credits || 0} credits means {user?.credits || 0} image
          generations.
        </Text>

        <Text className="text-white mt-6 mb-3 mx-2 text-xl font-jakarta-semibold">
          Privacy & Security
        </Text>

        <View className="justify-center items-center bg-[#27272a] p-6 rounded-[28px]">
          <View className="w-full">
            <Pressable
              className="flex-row items-center gap-3 w-full pb-3 active:opacity-80"
              onPress={() => {
                Linking.openURL("https://bzay911.github.io/Mantis-terms-of-use/");
              }}
            >
              <Ionicons name="document-text-outline" size={18} color="white" />
              <Text className="text-white font-jakarta text-lg">
                Terms of use
              </Text>
            </Pressable>
            <View className="h-[0.5px] bg-gray-500 w-[90%] self-center" />
          </View>

          <View className="w-full">
          <Pressable
            className="flex-row items-center gap-3 w-full mt-4 active:opacity-80 pb-3"
            onPress={() => {
              Linking.openURL("https://bzay911.github.io/Mantis-privacy-policy/");
            }}
            >
            <Ionicons name="lock-closed-outline" size={18} color="white" />
            <Text className="text-white font-jakarta text-lg">
              Privacy policy
            </Text>
          </Pressable>
                <View className="h-[0.5px] bg-gray-500 w-[90%] self-center" />
            </View>  

               <View className="flex-row items-center justify-between w-full mt-3">
              <View className="flex-row items-center gap-3">
                <Ionicons name="information-circle-outline" size={20} color="white" />
                <Text className="text-white text-lg font-jakarta">Version</Text>
              </View>
              <Text className="text-white text-lg font-jakarta">
                v1.0
              </Text>
            </View>
        </View>

        <Text className="text-white mt-6 mb-3 mx-2 text-xl font-jakarta-semibold">
          Danger Zone
        </Text>

        <Pressable
          className="flex-row items-center gap-3 w-full bg-[#27272a] p-6 rounded-[28px] active:opacity-80"
          onPress={() => {
            // Handle delete account logic
          }}
        >
          <Ionicons name="trash-outline" size={18} color="#f87171" />
          <Text className="text-[#f87171] font-jakarta text-lg">
            Delete Account
          </Text>
        </Pressable>

        <Text className="text-gray-500 mx-4 my-2 font-jakarta mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </Text>

        <Pressable
          className="flex-row items-center justify-center gap-3 w-full bg-[#27272a] p-6 rounded-[28px] active:opacity-80"
          onPress={() => {
            logout();
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text className="text-white font-jakarta text-lg">Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}