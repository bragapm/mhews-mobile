import AlertProvider from "@/components/AlertContext";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <AlertProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AlertProvider>
  );
}
