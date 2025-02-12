import { Slot, Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

function MainLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/splash");
    }
  }, [user]);

  if (!user) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <Slot />
      <MainLayout />
    </AuthProvider>
  );
}
