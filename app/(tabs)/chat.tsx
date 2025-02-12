import { View, Text, Button } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function ChatScreen() {
  const { logout } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Chat</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
