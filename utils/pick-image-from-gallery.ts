import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

/**
 * Requests gallery permission and launches the image picker.
 * Returns the selected image URI, or null if permission was denied
 * or the user cancelled the picker.
 */
export async function pickImageFromGallery(): Promise<string | null> {
  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    Alert.alert(
      "Permission required",
      "Permission to access the gallery is required!",
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 1,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0].uri;
}