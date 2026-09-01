import {
  ImageBackground,
  View,
  Text,
  FlatList,
  Pressable,
  Dimensions,
  RefreshControl,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { fetchAllGenerations } from "../../../../utils/fetch-all-generations";
import { useAuth } from "../../../../contexts/auth-context";
import formatDate from "../../../../utils/format-date";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 2;
const GAP = 6;
const ASPECT_RATIO = 5 / 4; // height = width * 1.33 — tweak this to taste, e.g. 3/2, 5/4, etc.
const ITEM_WIDTH = (width - 32 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const ITEM_HEIGHT = ITEM_WIDTH * ASPECT_RATIO;

type Generation = {
  id: string;
  resultImageUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
};

export default function MyHaircuts() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const {
    data: generatedImages = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<Generation[]>({
    queryKey: ["haircuts", accessToken],
    queryFn: () => {
      return fetchAllGenerations(accessToken!);
    },
    enabled: !!accessToken,
  });

  return (
    <SafeAreaView className="flex-1 bg-black p-4">
      <Text className="text-4xl font-fraunces-semibold text-white">
        My Haircuts
      </Text>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white font-jakarta">Loading...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white font-jakarta">
            Something went wrong loading your haircuts.
          </Text>
        </View>
      ) : generatedImages && generatedImages.length > 0 ? (
        <FlatList
          data={generatedImages}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#9DC228" // spinner color, matches your accent color
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                router.push({
                  pathname: "/(protected)/image-displayer",
                  params: { imageUrl: item.resultImageUrl },
                });
              }}
            >
              <View
                style={{
                  width: ITEM_WIDTH,
                  height: ITEM_HEIGHT,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <Image
                  source={{
                    uri: item.thumbnailUrl || item.resultImageUrl || undefined,
                  }}
                  style={{
                    width: ITEM_WIDTH,
                    height: ITEM_HEIGHT,
                    backgroundColor: "#1a1a1a",
                  }}
                  contentFit="cover"
                  transition={200}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                  }}
                >
                  <Text className="text-white text-xs font-jakarta-semibold">
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="images" size={34} color="#9DC228" />
          <View className="flex-row items-center justify-center mt-2">
            <Text className="text-xl font-jakarta-semibold text-white">
              No haircuts found !
            </Text>
          </View>
          <Text className="text-gray-400 text-center mt-2 font-jakarta">
            Tap the camera in the bottom-right corner to start creating your
            first haircut.
          </Text>
          <View className="absolute bottom-0 right-10">
            <ImageBackground
              source={require("../../../../assets/images/app-images/my-haircuts-palceholder.png")}
              className="h-80 w-80"
              resizeMode="cover"
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
