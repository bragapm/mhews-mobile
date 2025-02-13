import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const setTokens = async (newAccessToken: string | null, newRefreshToken: string | null) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);

    if (newAccessToken) {
      await AsyncStorage.setItem("accessTokenMhews", newAccessToken);
    } else {
      await AsyncStorage.removeItem("accessTokenMhews");
    }

    if (newRefreshToken) {
      await AsyncStorage.setItem("refreshTokenMhews", newRefreshToken);
    } else {
      await AsyncStorage.removeItem("refreshTokenMhews");
    }
  };

  useEffect(() => {
    const loadTokens = async () => {
      const savedAccessToken = await AsyncStorage.getItem("accessTokenMhews");
      const savedRefreshToken = await AsyncStorage.getItem("refreshTokenMhews");

      if (savedAccessToken) setAccessToken(savedAccessToken);
      if (savedRefreshToken) setRefreshToken(savedRefreshToken);
    };
    loadTokens();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem("accessTokenMhews");
    await AsyncStorage.removeItem("refreshTokenMhews");
    setAccessToken(null);
    setRefreshToken(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, setTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan dalam AuthProvider");
  }
  return context;
}
