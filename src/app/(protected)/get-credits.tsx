import {View } from "react-native";
import RevenueCatUI from "react-native-purchases-ui";
import { useRouter } from "expo-router";


export default function GetCredits() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <RevenueCatUI.Paywall
        onDismiss={() => {
          router.back();
        }}
      />
    </View>
  );
}