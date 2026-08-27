import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import  fetchHaircuts  from "../../../../utils/fetch-haircuts";
import { Image } from "expo-image";

type Haircut = {
  id: string;
  hairType: "Short" | "Medium" | "Long";
  cutName: string;
  imageUrl: string | null;
};

// random-ish icon assignment per hairType — swap these out anytime
const HAIR_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  All: "cut-outline",
  Short: "flash-outline",
  Medium: "layers-outline",
  Long: "water-outline",
};

const FALLBACK_ICON = "sparkles-outline" as const;

export default function ProtectedIndex() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("All");

  const {
    data: haircuts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["haircuts"],
    queryFn: fetchHaircuts,
  });

  // build chip list dynamically: "All" + unique hairTypes from the data
  const chips = useMemo(() => {
    const uniqueTypes = Array.from(new Set(haircuts.map((h) => h.hairType)));
    return ["All", ...uniqueTypes];
  }, [haircuts]);

  // filter based on selected chip
  const filtered = useMemo(() => {
    if (selectedType === "All") return haircuts;
    return haircuts.filter((h) => h.hairType === selectedType);
  }, [haircuts, selectedType]);

  // group filtered results by hairType for sectioned display
  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, Haircut[]>>((acc, item) => {
      (acc[item.hairType] ??= []).push(item);
      return acc;
    }, {});
  }, [filtered]);


  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">
          Something went wrong. Pull to refresh.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black p-2">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="flex-row items-center justify-between gap-4 p-2">
          <Text className="text-4xl font-bold text-white">Mantis</Text>
          <Pressable
            onPress={() => router.push("/(protected)/get-credits")}
            style={{ backgroundColor: "#9DC228" }}
            className="items-center justify-center rounded-full px-6 py-4"
          >
            <Text className="text-black text-lg font-bold">Get Credits</Text>
          </Pressable>
        </View>

        <Text className="mt-2 text-xl font-semibold text-white p-2">
          Choose your style
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className=" p-2"
        >
          {chips.map((type) => {
            const isActive = selectedType === type;
            return (
              <Pressable
                key={type}
                onPress={() => setSelectedType(type)}
                className="mr-6 items-center"
              >
                <View
                  className="mb-3 h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: isActive ? "#9DC228" : "#27272a" }}
                >
                  <Ionicons
                    name={HAIR_TYPE_ICONS[type] ?? FALLBACK_ICON}
                    size={26}
                    color={isActive ? "black" : "#9DC228"}
                  />
                </View>
                <Text
                  className="text-center text-sm"
                  style={{ color: isActive ? "#9DC228" : "white" }}
                >
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {Object.entries(grouped).map(([hairType, items]) => (
          <View key={hairType}>
            <Text className="mt-4 text-xl font-semibold text-white p-2">
              Hairstyle Options For {hairType} Hair
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4"
            >
              {items.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    router.push({
                      pathname: "/(protected)/image-displayer",
                      params: { imageUrl: item.imageUrl, cutName: item.cutName },
                    })
                  }
                  className="mr-4 w-36 overflow-hidden rounded-xl bg-zinc-900"
                >
                  <Image
                    source={
                      item.imageUrl
                        ? { uri: item.imageUrl }
                        : require("../../../../assets/images/app-images/mullet.jpeg")
                    }
                    style={{ height: 280, width: 200 }}
                    contentFit="cover"
                  />
                  <Text className="absolute bottom-0 px-3 py-3 text-sm font-semibold text-white">
                    {item.cutName}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ))}

        {filtered.length === 0 && (
          <Text className="mt-10 text-center text-zinc-500">
            No styles found for this filter.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
