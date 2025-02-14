import {
  View,
  Text,
  ImageBackground,
  useColorScheme,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import COLORS from "../config/COLORS";
import { LinearGradient } from "expo-linear-gradient";
import FloatingSOSButton from "@/components/FloatingSOSButton";
import { useEffect, useState } from "react";
import Modal from "react-native-modal";
import useAuthStore from "../hooks/auth";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const reset = useAuthStore((state) => state.reset);
  const router = useRouter();
  const { profile, getProfile } = useAuthStore();
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const iconQuestion = require("../../assets/icons/questionCircle.png");
  const backgroundSource =
    colorScheme === "dark"
      ? require("../../assets/images/bg-page-dark.png")
      : require("../../assets/images/bg-page-light.png");

  const options = [
    {
      title: "Detail Akun",
      icon: colorScheme === "dark"
        ? require("../../assets/images/detail-account-dark.png")
        : require("../../assets/images/detail-account-light.png"),
      route: "/pages/EditProfile",
    },
    {
      title: "Ubah Password",
      icon: colorScheme === "dark"
        ? require("../../assets/images/ubah-password-dark.png")
        : require("../../assets/images/ubah-password-light.png"),
      route: "/account/change-password",
    },
    {
      title: "Profil Kerabat",
      icon: colorScheme === "dark"
        ? require("../../assets/images/profil-kerabat-dark.png")
        : require("../../assets/images/profil-kerabat-light.png"),
      route: "/account/family-profile",
    },
    {
      title: "Bahasa",
      icon: colorScheme === "dark"
        ? require("../../assets/images/bahasa-dark.png")
        : require("../../assets/images/bahasa-light.png"),
      route: "/account/language",
    },
    {
      title: "Tentang Kami",
      icon: colorScheme === "dark"
        ? require("../../assets/images/tentang-kami-dark.png")
        : require("../../assets/images/tentang-kami-light.png"),
      route: "/account/about",
    },
    {
      title: "Pusat Bantuan",
      icon: colorScheme === "dark"
        ? require("../../assets/images/pusat-bantuan-dark.png")
        : require("../../assets/images/pusat-bantuan-light.png"),
      route: "/account/help",
    },
    {
      title: "Keluar Akun",
      icon: require("../../assets/images/exit.png"),
      isExit: true,
      action: () => handleLogout(),
    },
  ];

  const handleLogout = () => {
    reset();
    router.replace("/splash");
  };

  useEffect(() => {
    getProfile();
  }, []);

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
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.greeting, { color: colors.text }]}>
                Profil Saya
              </Text>
            </View>
          </View>
          <View style={[styles.card, { borderColor: colors.borderTwo }]}>
            <LinearGradient
              colors={[colors.gradientStartProfile, colors.gradientEndProfile]}
              style={styles.gradient}
            >
              <View style={styles.iconContainer}>
                <Image
                  // source={{ uri: `${ASSET_URL}${item.icon}` }}
                  source={require("../../assets/images/avatar.png")}
                  style={{ width: 54, height: 54, resizeMode: "cover" }}
                />
                <View style={styles.textContent}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {profile?.first_name} {profile?.last_name}
                  </Text>
                  <Text style={[styles.txtSubTitle, { color: colors.text }]}>
                    {profile?.NIK}
                  </Text>
                  <Text style={[styles.txtSubTitle, { color: colors.text }]}>
                    {profile?.email}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View
            style={[
              styles.contentOption,
              {
                backgroundColor: colorScheme === "dark" ? "#1c1c1c" : "#fff",
                borderRadius: 12,
                marginTop: "5%",
                paddingVertical: "2%",
              },
            ]}
          >
            {options.map((item: any, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionContainer}
                onPress={() => {
                  if (item.isExit && item.action) {
                    item.action();
                  } else {
                    router.push(item.route);
                  }
                }}
              >
                <View style={styles.optionLeft}>
                  <View style={styles.iconWrapper}>
                    <Image source={item.icon} style={styles.iconImage} />
                  </View>
                  <View style={styles.textWrapper}>
                    <Text
                      style={[
                        styles.textOption,
                        { color: item.isExit ? "#d9534f" : "#333" },
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>
                </View>
                {!item.isExit && (
                  <View style={styles.arrowWrapper}>
                    <Image
                      source={require("../../assets/images/arrow-right.png")}
                      style={styles.arrowIcon}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
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
  container: { flex: 1, padding: 16, marginTop: "5%" },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "bold",
  },
  card: {
    // marginRight: 14,

    alignItems: "center",
    justifyContent: "center",
    // marginBottom: 10,

    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#C3C3BF",
  },

  cardOption: {
    // marginRight: 14,

    alignItems: "center",
    justifyContent: "center",
    // marginBottom: 10,

    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#C3C3BF",
    width: "100%",
    alignSelf: "center",
    marginTop: "5%",
  },
  contentOption: {
    borderRadius: 12,
    // paddingHorizontal: "5%",
    // paddingVertical: "7%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  gradient: {
    borderRadius: 12,
    paddingHorizontal: "5%",
    paddingVertical: "7%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    width: "100%",
    paddingHorizontal: "0%",
    paddingVertical: "0%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "left",
  },
  textOption: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "left",
  },
  txtSubTitle: {
    fontSize: 12,
    fontWeight: "400",
    textAlign: "left",
  },
  textContent: {
    alignSelf: "flex-start",
    paddingHorizontal: "5%",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
    color: "#4F4D4A",
    textAlign: "right",
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  optionContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: "5%",
  },
  optionLeft: {
    width: "60%",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: "5%",
  },
  iconWrapper: {
    width: "10%",
    justifyContent: "center",
  },
  iconImage: {
    width: 30,
    height: 20,
    resizeMode: "contain",
  },
  textWrapper: {
    width: "80%",
    paddingHorizontal: "5%",
    justifyContent: "center",
  },

  arrowWrapper: {
    width: "10%",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowIcon: {
    width: 12,
    height: 12,
    marginRight: 15,
    resizeMode: "contain",
    tintColor: "#999",
  },
});