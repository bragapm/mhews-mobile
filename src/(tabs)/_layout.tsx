import React, { useEffect, useState } from "react";
import { Image, StatusBar, useColorScheme } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import COLORS from "../config/COLORS";
import useAuthStore from "../hooks/auth";
import HomeScreen from "./home";
import ChatScreen from "./chat";
import ProfileScreen from "./profile";
import { SOSModalProvider } from "../components/GlobalSOSModal";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const token = useAuthStore((state) => state.token);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [token]);

  const icons: any = {
    home: {
      active: require("../assets/images/home-active.png"),
      light: require("../assets/images/home-deactive-light.png"),
      dark: require("../assets/images/home-deactive-dark.png"),
    },
    chat: {
      active: require("../assets/images/chat-active.png"),
      light: require("../assets/images/chat-deactive-light.png"),
      dark: require("../assets/images/chat-deactive-dark.png"),
    },
    profile: {
      active: require("../assets/images/profile-active.png"),
      light: require("../assets/images/profile-deactive-light.png"),
      dark: require("../assets/images/profile-deactive-dark.png"),
    },
  };

  const getTabIcon = (focused: boolean, type: string) => (
    <Image
      source={
        focused
          ? icons[type].active
          : colorScheme !== "dark"
            ? icons[type].dark
            : icons[type].light
      }
      style={{ width: 24, height: 24 }}
      resizeMode="contain"
    />
  );

  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <SOSModalProvider>
      <Tab.Navigator
        initialRouteName="home"
        screenOptions={{
          tabBarActiveTintColor: colors.tabIconSelected,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarStyle: {
            backgroundColor: colors.background,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            borderTopWidth: 0,
            elevation: 4,
            shadowColor: "#3C221D",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="home"
          component={HomeScreen}
          options={{
            tabBarLabel: "Beranda",
            tabBarIcon: ({ focused }) => getTabIcon(focused, "home"),
          }}
        />
        <Tab.Screen
          name="chat"
          component={HomeScreen}
          options={{
            tabBarLabel: "Chatbot",
            tabBarIcon: ({ focused }) => getTabIcon(focused, "chat"),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("ChatScreen");
            },
          })}
        />
        {isAuthenticated && (
          <Tab.Screen
            name="profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: "Profile",
              tabBarIcon: ({ focused }) => getTabIcon(focused, "profile"),
            }}
          />
        )}
      </Tab.Navigator>
    </SOSModalProvider>
  );
}
