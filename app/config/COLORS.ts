import { useColorScheme } from "react-native";
import { ColorsConfig } from "./ColorsConfig";

export default function COLORS() {
  const colorScheme = useColorScheme();
  return colorScheme === "dark" ? ColorsConfig.dark : ColorsConfig.light;
}