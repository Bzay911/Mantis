import * as SecureStore from "expo-secure-store";

const KEY = "hasSeenOnboarding";

export const getHasSeenOnboarding = async () =>
  (await SecureStore.getItemAsync(KEY)) === "true";

export const markOnboardingSeen = () => SecureStore.setItemAsync(KEY, "true");

// export const resetOnboardingFlag = () => SecureStore.deleteItemAsync(KEY);