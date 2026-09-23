import { API_BASE_URL } from "../src/constants/api-config";

export async function deleteUserAccount(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/delete-user-account`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete account");
  }
}