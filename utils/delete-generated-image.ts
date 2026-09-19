import { API_BASE_URL } from "../src/constants/api-config";

export async function deleteGeneratedImage(accessToken: string, id: string) {
  const response = await fetch(`${API_BASE_URL}/api/images/delete-generated-image/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete generation");
  }
}