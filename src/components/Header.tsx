import React, { createContext, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { useColorScheme } from "react-native";
import COLORS from "../config/COLORS";
import colors from "../constants/colors";
import AntDesign from "react-native-vector-icons/AntDesign";

export const HeaderNav = ({
  onPress,
  title,
}: {
  onPress: () => void;
  title: string;
}) => {
  const colorScheme = useColorScheme();
  const colors = COLORS();
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onPress}>
        <AntDesign name="arrowleft" size={24} color={colors.tabIconDefault} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 20,
    flex: 1,
  },
});
