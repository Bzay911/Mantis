import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Purchases from "react-native-purchases";
import { API_BASE_URL } from "../src/constants/api-config";
import { checkRevenueCatUser } from "../utils/check-revenuecat-user";

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  login: (
    accessToken: string,
    refreshToken: string,
    user: User,
  ) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

interface User {
  id: string;
  displayName: string;
  email: string;
  credits: number;
  createdAt: Date | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (
    accessToken: string,
    refreshToken: string,
    userData: User,
  ) => {
    setAccessToken(accessToken);
    setUser(userData);
    await SecureStore.setItemAsync("accessToken", accessToken); // using securestore here than async storage (stores plain text) for better security
    await SecureStore.setItemAsync("refreshToken", refreshToken);
    await checkRevenueCatUser(userData.id);
  };

  const logout = async () => {
    setAccessToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");

    try {
      await Purchases.logOut();
    } catch (e) {
      console.error("RevenueCat logOut failed", e);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedAccessToken = await SecureStore.getItemAsync("accessToken");
        const storedRefreshToken =
          await SecureStore.getItemAsync("refreshToken");

        if (!storedAccessToken) {
          setLoading(false);
          return;
        }

        let response = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
          headers: {
            Authorization: `Bearer ${storedAccessToken}`,
          },
        });

        // tracking the current access token
        let currentAccessToken = storedAccessToken;

        if (!response.ok) {
          const refreshResponse = await fetch(
            `${API_BASE_URL}/api/auth/refresh-token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                refreshToken: storedRefreshToken,
              }),
            },
          );

          if (!refreshResponse.ok) {
            await logout();
            setLoading(false);
            return;
          }

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await refreshResponse.json();

          await SecureStore.setItemAsync("accessToken", newAccessToken);
          await SecureStore.setItemAsync("refreshToken", newRefreshToken);

          currentAccessToken = newAccessToken;

          response = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          });
        }

        if (response.ok) {
          const { user } = await response.json();
          setUser(user);
          setAccessToken(currentAccessToken);
          await checkRevenueCatUser(user.id);
        }
      } catch (error) {
        console.error("Error restoring session:", error);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
