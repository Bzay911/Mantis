import { useRouter } from "expo-router";
import { CameraCapture } from "../../../components/camera-capture";
import { useCapturedUserImageStore } from "../../../../store/captured-user-image";

export default function Camera() {
  const router = useRouter();
    const setCapturedUserImage = useCapturedUserImageStore(
    (s) => s.setCapturedUserImage,
  );
  return (
   <CameraCapture
      onClose={() => router.back()}
      onProceed={(uri) => {
        setCapturedUserImage(uri);
        router.push("/(protected)/ai-page")
      }}
    />
  );
}
