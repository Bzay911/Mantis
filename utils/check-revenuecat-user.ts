import Purchases from "react-native-purchases";

export const checkRevenueCatUser = async (userId: string | undefined | null) => {
  if (!userId) {
    console.log("Skipping RevenueCat login — no userId yet");
    return;
  }
  try {
    console.log("Checking RevenueCat user for userId:", userId);
    const currentAppUserID = await Purchases.getAppUserID();
    if (currentAppUserID === userId) return;
    await Purchases.logIn(userId);
  } catch (error) {
    console.error("Error logging in with RevenueCat:", error);
  }
};