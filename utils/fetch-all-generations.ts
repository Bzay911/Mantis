import { API_BASE_URL } from "../src/constants/api-config";

export const fetchAllGenerations = async (accessToken: string) => {
    const response = await fetch(`${API_BASE_URL}/api/images/get-all-generated-images`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch generations: ${response.statusText}`);
    }
    const data = await response.json();
    return data.generations;
}