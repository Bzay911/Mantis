import { API_BASE_URL } from "../src/constants/api-config";

type Haircut = {
  id: string;
  hairType: "Short" | "Medium" | "Long";
  cutName: string;
  imageUrl: string | null;
};

const fetchHaircuts = async (): Promise<Haircut[]> => {
  const response = await fetch(`${API_BASE_URL}/api/haircuts/get-all-haircuts`);
  if (!response.ok) throw new Error("Failed to fetch haircuts");
  return response.json();
};

export default fetchHaircuts;