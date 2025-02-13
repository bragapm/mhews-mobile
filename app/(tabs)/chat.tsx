import FloatingSOSButton from "@/components/FloatingSOSButton";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ImageBackground,
  Dimensions,
  Image,
  ScrollView,
  TextInput,
} from "react-native";

export default function ChatScreen() {
  const colorScheme = useColorScheme();

  const backgroundSource =
    colorScheme === "dark"
      ? require("../../assets/images/bg-home.png")
      : require("../../assets/images/bg-home.png");

  return (
    <ImageBackground
      source={backgroundSource}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.overlay} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Chat</Text>
        </View>
      </ScrollView>
      <FloatingSOSButton />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});