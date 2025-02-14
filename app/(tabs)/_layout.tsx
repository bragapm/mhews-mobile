import React from "react";
import { Image, StatusBar, useColorScheme } from "react-native";
import { Tabs } from "expo-router";
import COLORS from "../config/COLORS";
import useAuthStore from "../hooks/auth";
import { SOSModalProvider } from "@/components/GlobalSOSModal";
import { AlertProvider } from "@/components/AlertContext";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const token = useAuthStore((state) => state.token);

  if (!token) return null;

  const icons: any = {
    home: {
      active: require("../../assets/images/home-active.png"),
      light: require("../../assets/images/home-deactive-light.png"),
      dark: require("../../assets/images/home-deactive-dark.png"),
    },
    chat: {
      active: require("../../assets/images/chat-active.png"),
      light: require("../../assets/images/chat-deactive-light.png"),
      dark: require("../../assets/images/chat-deactive-dark.png"),
    },
    profile: {
      active: require("../../assets/images/profile-active.png"),
      light: require("../../assets/images/profile-deactive-light.png"),
      dark: require("../../assets/images/profile-deactive-dark.png"),
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

  return (
    <SOSModalProvider>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <Tabs
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
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: "Beranda",
            tabBarIcon: ({ focused }) => getTabIcon(focused, "home"),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            tabBarLabel: "Chatbot",
            tabBarIcon: ({ focused }) => getTabIcon(focused, "chat"),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: "Profile",
            tabBarIcon: ({ focused }) => getTabIcon(focused, "profile"),
          }}
        />
      </Tabs>
    </SOSModalProvider>
  );
}
