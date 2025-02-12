import React from "react";
import { Image, useColorScheme } from "react-native";
import { Tabs } from "expo-router";
import COLORS from "../config/COLORS";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = COLORS();

  const icons = {
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

  const getTabIcon = (focused, type) => {
    return (
      <Image
        source={
          focused
            ? icons[type].active
            : colorScheme === "dark"
            ? icons[type].dark
            : icons[type].light
        }
        style={{ width: 24, height: 24 }}
        resizeMode="contain"
      />
    );
  };

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.background,
          marginBottom: "2%",
          height: "10%",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "2%",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => getTabIcon(focused, "home"),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused }) => getTabIcon(focused, "chat"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => getTabIcon(focused, "profile"),
        }}
      />
    </Tabs>
  );
}
