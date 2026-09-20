import {
  ImageBackground,
  View,
  Text,
  SectionList,
  Pressable,
  Dimensions,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Presets } from "react-native-pulsar";
import { useMemo } from "react";
import { deleteGeneratedImage } from "../../../../utils/delete-generated-image";
import { fetchAllGenerations } from "../../../../utils/fetch-all-generations";
import { useAuth } from "../../../../contexts/auth-context";
import formatDate from "../../../../utils/format-date";
import { useRouter } from "expo-router";
import { getDateGroupLabel } from "../../../../utils/date-group-helpers";
import { Generation } from "../../../../types/generation";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 2;
const GAP = 6;
const ASPECT_RATIO = 5 / 4;
const ITEM_WIDTH = (width - 32 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const ITEM_HEIGHT = ITEM_WIDTH * ASPECT_RATIO;

function getDateGroupKey(dateString: string) {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function chunkIntoRows<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export default function MyHaircuts() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGeneratedImage(accessToken!, id),
    onSuccess: () => {
      Presets.System.notificationSuccess();
      queryClient.invalidateQueries({ queryKey: ["haircuts", accessToken] });
    },
    onError: () => {
       Presets.System.notificationError();
      Alert.alert("Couldn't delete", "Please try again.");
    },
  });

  const confirmDelete = (item: Generation) => {
    Alert.alert(
      "Delete this generated haircut?",
      "This action can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(item.id),
        },
      ],
    );
  };

  // Group images by calendar day, then chunk each day's items into rows of NUM_COLUMNS
  const sections = useMemo(() => {
    const groups: Record<
      string,
      { label: string; sortDate: Date; items: Generation[] }
    > = {};

    for (const item of generatedImages) {
      const key = getDateGroupKey(item.createdAt);
      if (!groups[key]) {
        groups[key] = {
          label: getDateGroupLabel(item.createdAt),
          sortDate: new Date(item.createdAt),
          items: [],
        };
      }
      groups[key].items.push(item);
    }

    return Object.values(groups)
      .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime()) // newest day first
      .map((group) => ({
        title: group.label,
        data: chunkIntoRows(group.items, NUM_COLUMNS),
      }));
  }, [generatedImages]);

  const renderHaircutCard = (item: Generation) => {
    const isDeleting =
      deleteMutation.isPending && deleteMutation.variables === item.id;

    return (
      <Pressable
        key={item.id}
        onPress={() => {
          router.push({
            pathname: "/(protected)/generated-image-displayer",
            params: { imageUrl: item.resultImageUrl },
          });
        }}
        onLongPress={() => {
          Presets.System.impactMedium();
          confirmDelete(item);
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

          {isDeleting && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            >
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </View>
      </Pressable>
    );
  };

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
        <SectionList
          sections={sections}
          keyExtractor={(row, index) => row.map((i) => i.id).join("-") + index}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#9DC228"
            />
          }
          renderSectionHeader={({ section }) => (
            <Text className="text-white text-xl font-jakarta-semibold mb-3 mt-2">
              {section.title}
            </Text>
          )}
          renderItem={({ item: row }) => (
            <View
              style={{
                flexDirection: "row",
                gap: GAP,
                marginBottom: GAP,
              }}
            >
              {row.map((item) => renderHaircutCard(item))}
              {/* filler so an odd last item doesn't stretch full width */}
              {row.length < NUM_COLUMNS && (
                <View style={{ width: ITEM_WIDTH }} />
              )}
            </View>
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
