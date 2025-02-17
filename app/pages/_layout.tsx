import { SOSModalProvider } from "@/components/GlobalSOSModal";
import { Stack } from "expo-router";

export default function PagesLayout() {
    return (
        <SOSModalProvider>
            <Stack screenOptions={{ headerShown: false }} />;
        </SOSModalProvider>
    )
}
